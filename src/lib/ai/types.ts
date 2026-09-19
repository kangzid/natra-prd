import type { AIProviderConfig } from '../../types';

export interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  onStreamChunk?: (chunk: string, fullText: string) => void;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  testConnection(config: AIProviderConfig): Promise<ConnectionTestResult>;
  generateText(config: AIProviderConfig, options: GenerateOptions): Promise<string>;
}
