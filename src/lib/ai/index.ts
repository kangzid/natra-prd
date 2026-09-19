import type { AIProvider } from './types';
import { GeminiProvider } from './gemini';
import { OpenAICompatibleProvider } from './openai';

export * from './types';
export * from './gemini';
export * from './openai';

const providersMap: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  'openai-compatible': new OpenAICompatibleProvider(),
  custom: new OpenAICompatibleProvider(),
};

export function getAIProviderInstance(type: string): AIProvider {
  return providersMap[type] || providersMap['gemini'];
}
