import type { AIProviderConfig } from '../../types';
import type { AIProvider, ConnectionTestResult, GenerateOptions } from './types';

export class OpenAICompatibleProvider implements AIProvider {
  id = 'openai-compatible';
  name = 'OpenAI-Compatible (Custom / Ollama / Groq / DeepSeek)';

  private getBaseUrl(config: AIProviderConfig): string {
    const raw = config.baseUrl?.trim() || 'https://api.openai.com/v1';
    return raw.replace(/\/+$/, '');
  }

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    const baseUrl = this.getBaseUrl(config);
    const model = (config.defaultModel || 'gpt-4o-mini').trim();

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = errorData?.error?.message || response.statusText;
        return {
          success: false,
          message: `Connection failed (${response.status})`,
          details: msg,
        };
      }

      return {
        success: true,
        message: `Successfully connected to ${baseUrl} with model "${model}"!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error or CORS issue',
        details: err?.message || 'Could not connect to custom provider endpoint.',
      };
    }
  }

  async generateText(config: AIProviderConfig, options: GenerateOptions): Promise<string> {
    const baseUrl = this.getBaseUrl(config);
    const model = (options.model || config.defaultModel || 'gpt-4o-mini').trim();

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: options.prompt });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? config.maxTokens ?? 8192,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const msg = errorData?.error?.message || response.statusText;
      throw new Error(`Provider Error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Provider returned an empty response.');
    }
    return text;
  }
}
