import type { AIProviderConfig } from '../../types';
import type { AIProvider, ConnectionTestResult, GenerateOptions } from './types';

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_DIRECT_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const RECOMMENDED_GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b', desc: 'Free • Flagship 120B Reasoning (Default)' },
  { id: 'openai/gpt-oss-20b', label: 'openai/gpt-oss-20b', desc: 'Free • Ultra-Fast 20B (1000 tok/s)' },
  { id: 'qwen/qwen3.8-27b', label: 'qwen/qwen3.8-27b', desc: 'Free • Qwen 3.8 27B Multilingual' },
  { id: 'allam-2-7b', label: 'allam-2-7b', desc: 'Free • Lightweight 7B' },
] as const;

export const LEGACY_GROQ_MODELS = new Set([
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
]);

export function normalizeGroqModel(model?: string): string {
  const trimmed = (model || '').trim();
  if (!trimmed || LEGACY_GROQ_MODELS.has(trimmed.toLowerCase())) {
    return DEFAULT_GROQ_MODEL;
  }
  return trimmed;
}

export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq';

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    const cleanKey = (config.apiKey || '').replace(/\s+/g, '');
    if (!cleanKey) {
      return {
        success: false,
        message: 'No Groq API key provided',
        details: 'Please enter your Groq API key (gsk_...) manually in Settings or the Builder panel.',
      };
    }

    const model = normalizeGroqModel(config.defaultModel);

    try {
      const response = await fetch('/api/groq/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: cleanKey,
          model,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

      // Fallback directly to Groq API if /api/groq/test is absent on a static-only host
      if (response.status === 404 && !data) {
        return this.testConnectionDirect(cleanKey, model);
      }

      if (!response.ok || !data?.success) {
        return {
          success: false,
          message: data?.message || `Groq connection failed (${response.status})`,
          details: data?.details || response.statusText,
        };
      }

      return {
        success: true,
        message: data.message || `Successfully connected to Groq (${model})!`,
      };
    } catch {
      return this.testConnectionDirect(cleanKey, model);
    }
  }

  private async testConnectionDirect(apiKey: string, model: string): Promise<ConnectionTestResult> {
    try {
      const response = await fetch(GROQ_DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Ping test. Reply with: OK' }],
          max_tokens: 10,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          success: false,
          message:
            response.status === 401
              ? 'Invalid Groq API key'
              : response.status === 404
                ? `Groq model "${model}" was not found`
                : `Groq connection failed (${response.status})`,
          details: data?.error?.message || response.statusText,
        };
      }

      return {
        success: true,
        message: `Successfully connected to Groq (${model})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error reaching Groq API',
        details: err?.message || 'Could not reach api.groq.com.',
      };
    }
  }

  async generateText(config: AIProviderConfig, options: GenerateOptions): Promise<string> {
    const cleanKey = (config.apiKey || '').replace(/\s+/g, '');
    if (!cleanKey) {
      throw new Error(
        'Groq API Key is empty. Please enter your own Groq API key (gsk_...) manually in Settings or the Builder panel.'
      );
    }

    const model = normalizeGroqModel(options.model || config.defaultModel);
    const useStreaming = Boolean(options.onStreamChunk);

    const response = await fetch('/api/groq/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cleanKey,
        model,
        prompt: options.prompt,
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? config.maxTokens ?? 8192,
        stream: useStreaming,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.status === 404 && !contentType.includes('application/json') && !contentType.includes('text/event-stream')) {
      return this.generateTextDirect(cleanKey, model, config, options);
    }

    if (!response.ok) {
      const errorData = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
      const errMsg = errorData?.error || errorData?.details || response.statusText;
      throw new Error(errMsg || `Groq API error (${response.status})`);
    }

    if (useStreaming && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              options.onStreamChunk?.(parsed.text, accumulatedText);
            }
          } catch (parseErr: any) {
            if (parseErr?.message && !/JSON/i.test(parseErr.message)) {
              throw parseErr;
            }
          }
        }
      }

      if (accumulatedText.trim().length > 0) {
        return accumulatedText;
      }
      throw new Error('Groq returned an empty streamed response. Please try again.');
    }

    const data = await response.json();
    if (!data?.text) {
      throw new Error(data?.error || 'Groq returned an empty response. Please try again.');
    }
    return data.text;
  }

  private async generateTextDirect(
    apiKey: string,
    model: string,
    config: AIProviderConfig,
    options: GenerateOptions
  ): Promise<string> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: options.prompt });

    const useStreaming = Boolean(options.onStreamChunk);
    const response = await fetch(GROQ_DIRECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? config.maxTokens ?? 8192,
        stream: useStreaming,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Groq API error (${response.status})`);
    }

    if (useStreaming && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulatedText += delta;
              options.onStreamChunk?.(delta, accumulatedText);
            }
          } catch {
            // ignore partial JSON chunks
          }
        }
      }

      if (accumulatedText.trim().length > 0) {
        return accumulatedText;
      }
      throw new Error('Groq returned an empty streamed response. Please try again.');
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Groq returned an empty response. Please try again.');
    }
    return text;
  }
}
