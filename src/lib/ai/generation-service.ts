import type { Project, AIProviderConfig, Builder } from '../../types';
import { getAIProviderInstance } from './index';
import { DEFAULT_GEMINI_MODEL } from './gemini';
import { DEFAULT_GROQ_MODEL } from './groq';
import { constructPRDPrompt } from '../../templates/prd-template';
import { FRAMEWORK_SYSTEM_PROMPT } from '../../templates/framework-templates';

export interface GenerationParams {
  project: Project;
  builder: Builder;
  inputs: Record<string, any>;
  providerConfig: AIProviderConfig;
  modelOverride?: string;
  onStreamChunk?: (chunk: string, fullText: string) => void;
}

export interface FrameworkGenerationParams {
  prompt: string;
  systemInstruction?: string;
  providerConfig: AIProviderConfig;
  modelOverride?: string;
  onStreamChunk?: (chunk: string, fullText: string) => void;
}

function getDefaultModelForProvider(type: string): string {
  return type === 'groq' ? DEFAULT_GROQ_MODEL : DEFAULT_GEMINI_MODEL;
}

export async function generateDocumentContent(params: GenerationParams): Promise<string> {
  const { project, builder, inputs, providerConfig, modelOverride, onStreamChunk } = params;

  if (!providerConfig.apiKey || !providerConfig.apiKey.trim()) {
    throw new Error('API Key is empty. Please enter your own API key manually in Settings or the Builder panel.');
  }

  const model = (modelOverride || providerConfig.defaultModel || getDefaultModelForProvider(providerConfig.type)).trim();
  const provider = getAIProviderInstance(providerConfig.type);

  const prompt = constructPRDPrompt(inputs, project.name, project.type, project.scope);
  const systemInstruction = builder.systemPrompt;

  const rawOutput = await provider.generateText(providerConfig, {
    prompt,
    systemInstruction,
    model,
    temperature: providerConfig.temperature,
    maxTokens: providerConfig.maxTokens,
    onStreamChunk,
  });

  return cleanMarkdownOutput(rawOutput);
}

export async function generateFrameworkDocument(params: FrameworkGenerationParams): Promise<string> {
  const { prompt, systemInstruction, providerConfig, modelOverride, onStreamChunk } = params;

  if (!providerConfig.apiKey || !providerConfig.apiKey.trim()) {
    throw new Error('API Key is empty. Please enter your own API key manually in Settings or the Pipeline AI bar.');
  }

  const model = (modelOverride || providerConfig.defaultModel || getDefaultModelForProvider(providerConfig.type)).trim();
  const provider = getAIProviderInstance(providerConfig.type);

  const rawOutput = await provider.generateText(providerConfig, {
    prompt,
    systemInstruction: systemInstruction || FRAMEWORK_SYSTEM_PROMPT,
    model,
    temperature: providerConfig.temperature,
    maxTokens: providerConfig.maxTokens,
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
