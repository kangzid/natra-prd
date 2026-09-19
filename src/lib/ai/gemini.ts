import type { AIProviderConfig } from '../../types';
import type { AIProvider, ConnectionTestResult, GenerateOptions } from './types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';

  async testConnection(config: AIProviderConfig): Promise<ConnectionTestResult> {
    if (!config.apiKey || !config.apiKey.trim()) {
      return {
        success: false,
        message: 'No API key provided',
        details: 'Please enter a valid Google Gemini API key.',
      };
    }

    const model = (config.defaultModel || 'gemini-2.5-flash').trim();
    const cleanKey = config.apiKey.trim();

    try {
      // Test by making a lightweight request to the Gemini generateContent API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Ping test. Reply with: OK' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || response.statusText;
        if (response.status === 400 || response.status === 403) {
          return {
            success: false,
            message: 'Invalid API key or permission denied',
            details: errMsg,
          };
        }
        if (response.status === 404) {
          return {
            success: false,
            message: `Model "${model}" was not found`,
            details: `Google reported 404: ${errMsg}. Check if the model name is spelled correctly.`,
          };
        }
        if (response.status === 429) {
          return {
            success: false,
            message: 'Rate limit or quota reached',
            details: errMsg,
          };
        }
        return {
          success: false,
          message: `Connection failed (${response.status})`,
          details: errMsg,
        };
      }

      return {
        success: true,
        message: `Successfully connected to Google Gemini (${model})!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error or browser CORS restriction',
        details: err?.message || 'Failed to reach Google Gemini endpoint.',
      };
    }
  }

  async generateText(config: AIProviderConfig, options: GenerateOptions): Promise<string> {
    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error('Google Gemini API Key is missing. Please enter your API key in the provider configuration or Settings.');
    }

    const model = (options.model || config.defaultModel || 'gemini-2.5-flash').trim();
    const cleanKey = config.apiKey.trim();

    // Prepare body
    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? config.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? config.maxTokens ?? 8192,
      },
    };

    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    // Try streaming first if onStreamChunk is provided
    if (options.onStreamChunk) {
      try {
        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(cleanKey)}`;
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errMsg = errorData?.error?.message || response.statusText;
          throw new Error(`Google Gemini Error (${response.status}): ${errMsg}`);
        }

        if (response.body) {
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
              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.substring(6).trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (chunkText) {
                    accumulatedText += chunkText;
                    options.onStreamChunk(chunkText, accumulatedText);
                  }
                } catch {
                  // Ignore JSON parse errors in malformed stream lines
                }
              }
            }
          }

          if (accumulatedText.trim().length > 0) {
            return accumulatedText;
          }
        }
      } catch (streamErr: any) {
        console.warn('Streaming failed or incomplete, falling back to standard generation:', streamErr);
      }
    }

    // Standard Non-streaming fallback
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cleanKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errMsg = errorData?.error?.message || response.statusText;

      if (response.status === 400 || response.status === 403) {
        throw new Error(`Invalid Gemini API key or unauthorized: ${errMsg}`);
      }
      if (response.status === 404) {
        throw new Error(`Model "${model}" not found: ${errMsg}. Please verify the model name in settings.`);
      }
      if (response.status === 429) {
        throw new Error(`Google Gemini rate limit exceeded or quota exhausted: ${errMsg}`);
      }
      throw new Error(`Gemini API error (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      if (candidate?.finishReason) {
        throw new Error(`Generation ended unexpectedly with reason: ${candidate.finishReason}`);
      }
      throw new Error('Google Gemini returned an empty response. Please try again.');
    }

    return text;
  }
}
