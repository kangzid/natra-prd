import type { AIProviderConfig } from '../../types';
import type { AIProvider, ConnectionTestResult, GenerateOptions } from './types';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const RECOMMENDED_GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', desc: 'Free • Stable & Fast (Default)' },
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite', desc: 'Free • Ultra-Fast Lite' },
  { id: 'gemini-4-hydrogen', label: 'gemini-4-hydrogen', desc: 'Free • Gemini 4 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite', desc: 'Free • Lightweight' },
] as const;

export const LEGACY_GEMINI_MODELS = new Set([
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-2.0-flash-thinking',
  'gemini-2.5-flash-lite',
]);

export function normalizeGeminiModel(model?: string): string {
  const trimmed = (model || '').trim();
  if (!trimmed || LEGACY_GEMINI_MODELS.has(trimmed.toLowerCase())) {
    return DEFAULT_GEMINI_MODEL;
  }
  return trimmed;
}

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    const cleanKey = (config.apiKey || '').replace(/\s+/g, '');
    if (!cleanKey) {
      return {
        success: false,
        message: 'No API key provided',
        details: 'Please enter your Google Gemini API key manually in Settings or the Builder panel.',
      };
    }

    const model = (config.defaultModel || DEFAULT_GEMINI_MODEL).trim();

    try {
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: cleanKey,
          model,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

      if (!response.ok || !data?.success) {
        if (response.status === 404 && !data) {
          return {
            success: false,
            message: 'Backend endpoint /api/gemini/test not found (404)',
            details:
              'Ensure the app is deployed with the /api serverless functions (Vercel) or running via server.ts (npm run dev).',
          };
        }

        return {
          success: false,
          message: data?.message || `Connection failed (${response.status})`,
          details: data?.details || response.statusText,
        };
      }

      return {
        success: true,
        message: data.message || `Successfully connected to Google Gemini (${model})!`,
        details: data.details,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error reaching API server',
        details: err?.message || 'Failed to reach /api/gemini/test.',
      };
    }
  }

  async generateText(config: AIProviderConfig, options: GenerateOptions): Promise<string> {
    const cleanKey = (config.apiKey || '').replace(/\s+/g, '');
    if (!cleanKey) {
      throw new Error(
        'Google Gemini API Key is empty. Please enter your own API key manually in Settings or the Builder panel.'
      );
    }

    const model = (options.model || config.defaultModel || DEFAULT_GEMINI_MODEL).trim();
    const useStreaming = Boolean(options.onStreamChunk);

    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cleanKey,
        model,
        prompt: options.prompt,
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? config.temperature,
        maxTokens: options.maxTokens ?? config.maxTokens,
        stream: useStreaming,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const errorData = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
      if (response.status === 404 && !errorData) {
        throw new Error(
          'Backend endpoint /api/gemini/generate returned 404. Redeploy with /api serverless functions (Vercel) or run via server.ts.'
        );
      }
      const errMsg = errorData?.error || errorData?.details || response.statusText;
      throw new Error(errMsg || `Gemini API error (${response.status})`);
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
      throw new Error('Google Gemini returned an empty streamed response. Please try again.');
    }

    const data = await response.json();
    if (!data?.text) {
      throw new Error(data?.error || 'Google Gemini returned an empty response. Please try again.');
    }
    return data.text;
  }
}
