import type { Project, AIProviderConfig, Builder } from '../../types';
import { getAIProviderInstance } from './index';
import { constructPRDPrompt } from '../../templates/prd-template';

export interface GenerationParams {
  project: Project;
  builder: Builder;
  inputs: Record<string, any>;
  providerConfig: AIProviderConfig;
  modelOverride?: string;
  onStreamChunk?: (chunk: string, fullText: string) => void;
}

export async function generateDocumentContent(params: GenerationParams): Promise<string> {
  const { project, builder, inputs, providerConfig, modelOverride, onStreamChunk } = params;

  if (!providerConfig.apiKey || !providerConfig.apiKey.trim()) {
    throw new Error('API Key is missing. Please configure your API key in the provider settings.');
  }

  const model = (modelOverride || providerConfig.defaultModel || 'gemini-2.5-flash').trim();
  const provider = getAIProviderInstance(providerConfig.type);

  const prompt = constructPRDPrompt(inputs, project.name, project.type);
  const systemInstruction = builder.systemPrompt;

  const rawOutput = await provider.generateText(providerConfig, {
    prompt,
    systemInstruction,
    model,
    temperature: providerConfig.temperature ?? 0.7,
    maxTokens: providerConfig.maxTokens ?? 8192,
    onStreamChunk,
  });

  return cleanMarkdownOutput(rawOutput);
}

/**
 * Strips outer ```markdown and ``` if the model wrapped the full response
 */
export function cleanMarkdownOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.replace(/^```markdown\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}
