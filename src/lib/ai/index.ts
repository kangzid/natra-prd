import type { AIProvider } from './types';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';

export * from './types';
export * from './gemini';
export * from './groq';

const providersMap: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
};

export function getAIProviderInstance(type: string): AIProvider {
  return providersMap[type] || providersMap['gemini'];
}
