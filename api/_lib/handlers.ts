import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function isGemini4Model(model: string): boolean {
  return model.trim().toLowerCase().startsWith('gemini-4');
}

function sanitizeApiKey(key: unknown): string {
  return typeof key === 'string' ? key.replace(/\s+/g, '') : '';
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: sanitizeApiKey(apiKey),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function readJsonBody(req: any): Promise<Record<string, any>> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (req.readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
  }
  return {};
}

function sendJson(res: any, statusCode: number, payload: unknown) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function parseGeminiError(err: unknown, model: string): { status: number; message: string; details: string } {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown Gemini API error');
  const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|503)\b/);
  const status = statusMatch ? Number(statusMatch[1]) : 500;

  if (status === 400 || status === 401 || status === 403 || /API_KEY_INVALID|PERMISSION_DENIED/i.test(rawMessage)) {
    return {
      status: status === 500 ? 403 : status,
      message: 'Invalid Gemini API key or permission denied',
      details: rawMessage,
    };
  }
  if (status === 404 || /NOT_FOUND/i.test(rawMessage)) {
    return {
      status: 404,
      message: `Model "${model}" was not found`,
      details: `Verify the free model name (e.g., gemini-2.5-flash, gemini-3.5-flash-lite, gemini-4-hydrogen, gemini-3.1-flash-lite). Details: ${rawMessage}`,
    };
  }
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(rawMessage)) {
    return {
      status: 429,
      message: 'Rate limit or free-tier quota reached',
      details: rawMessage,
    };
  }
  if (status === 503 || /UNAVAILABLE|high demand/i.test(rawMessage)) {
    return {
      status: 503,
      message: `Model "${model}" is temporarily busy (high demand)`,
      details: `Try switching to gemini-2.5-flash or gemini-3.5-flash-lite, or retry in a few seconds. Details: ${rawMessage}`,
    };
  }
  return {
    status,
    message: 'Gemini API request failed',
    details: rawMessage,
  };
}

export async function handleGeminiTest(req: any, res: any): Promise<void> {
  if (req.method && req.method !== 'POST') {
    sendJson(res, 405, { success: false, message: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const cleanKey = sanitizeApiKey(body.apiKey);
  const cleanModel = (typeof body.model === 'string' && body.model.trim()) || DEFAULT_GEMINI_MODEL;

  if (!cleanKey) {
    sendJson(res, 400, {
      success: false,
      message: 'No API key provided',
      details: 'Please enter your Google Gemini API key manually in Settings or the Builder panel.',
    });
    return;
  }

  try {
    const ai = createGeminiClient(cleanKey);

    // Step 1: Instantly verify API key validity & model availability (immune to 503 inference spikes)
    await ai.models.get({ model: cleanModel });

    // Step 2: Run lightweight generation ping
    try {
      await ai.models.generateContent({
        model: cleanModel,
        contents: 'Ping test. Reply with: OK',
      });

      sendJson(res, 200, {
        success: true,
        message: `Successfully connected to Google Gemini (${cleanModel})!`,
      });
    } catch (pingErr: unknown) {
      const parsed = parseGeminiError(pingErr, cleanModel);
      if (parsed.status === 503) {
        sendJson(res, 200, {
          success: true,
          message: `API key verified! Note: "${cleanModel}" is temporarily busy (503 high demand).`,
          details: 'Your API key works cleanly. For faster responses right now, try gemini-2.5-flash or gemini-3.5-flash-lite.',
        });
        return;
      }
      throw pingErr;
    }
  } catch (err: unknown) {
    const parsed = parseGeminiError(err, cleanModel);
    sendJson(res, parsed.status, {
      success: false,
      message: parsed.message,
      details: parsed.details,
    });
  }
}

export async function handleGeminiGenerate(req: any, res: any): Promise<void> {
  if (req.method && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const { apiKey, model, prompt, systemInstruction, temperature, maxTokens, stream } = body;
  const cleanKey = sanitizeApiKey(apiKey);
  const cleanModel = (typeof model === 'string' && model.trim()) || DEFAULT_GEMINI_MODEL;

  if (!cleanKey) {
    sendJson(res, 400, {
      error: 'Google Gemini API Key is missing. Please enter your API key manually in Settings or the Builder panel.',
    });
    return;
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    sendJson(res, 400, { error: 'Prompt is required.' });
    return;
  }

  const config: Record<string, unknown> = {};
  if (typeof systemInstruction === 'string' && systemInstruction.trim()) {
    config.systemInstruction = systemInstruction.trim();
  }

  // Do not pass deprecated sampling parameters (temperature, topP, topK) to gemini-4-* models
  if (!isGemini4Model(cleanModel)) {
    if (typeof temperature === 'number' && !Number.isNaN(temperature)) {
      config.temperature = temperature;
    }
    if (typeof maxTokens === 'number' && !Number.isNaN(maxTokens)) {
      config.maxOutputTokens = maxTokens;
    }
  }

  try {
    const ai = createGeminiClient(cleanKey);

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const streamResponse = await ai.models.generateContentStream({
        model: cleanModel,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      let hasText = false;
      for await (const chunk of streamResponse) {
        const text = chunk.text || '';
        if (text) {
          hasText = true;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      if (!hasText) {
        res.write(`data: ${JSON.stringify({ error: 'Google Gemini returned an empty response.' })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const response = await ai.models.generateContent({
      model: cleanModel,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    const text = response.text;
    if (!text) {
      sendJson(res, 502, { error: 'Google Gemini returned an empty response. Please try again.' });
      return;
    }

    sendJson(res, 200, { text });
  } catch (err: unknown) {
    const parsed = parseGeminiError(err, cleanModel);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: `${parsed.message}: ${parsed.details}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      sendJson(res, parsed.status, {
        error: `${parsed.message}: ${parsed.details}`,
      });
    }
  }
}

export async function handleGroqTest(req: any, res: any): Promise<void> {
  if (req.method && req.method !== 'POST') {
    sendJson(res, 405, { success: false, message: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const cleanKey = sanitizeApiKey(body.apiKey);
  const cleanModel = (typeof body.model === 'string' && body.model.trim()) || DEFAULT_GROQ_MODEL;

  if (!cleanKey) {
    sendJson(res, 400, {
      success: false,
      message: 'No Groq API key provided',
      details: 'Please enter your Groq API key (gsk_...) manually in Settings or the Builder panel.',
    });
    return;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model: cleanModel,
        messages: [{ role: 'user', content: 'Ping test. Reply with: OK' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg = data?.error?.message || response.statusText || 'Groq API error';
      sendJson(res, response.status, {
        success: false,
        message:
          response.status === 401
            ? 'Invalid Groq API key'
            : response.status === 404
              ? `Groq model "${cleanModel}" was not found`
              : `Groq connection failed (${response.status})`,
        details: errMsg,
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      message: `Successfully connected to Groq (${cleanModel})!`,
    });
  } catch (err: unknown) {
    sendJson(res, 500, {
      success: false,
      message: 'Network error contacting Groq API',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function handleGroqGenerate(req: any, res: any): Promise<void> {
  if (req.method && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const { apiKey, model, prompt, systemInstruction, temperature, maxTokens, stream } = body;
  const cleanKey = sanitizeApiKey(apiKey);
  const cleanModel = (typeof model === 'string' && model.trim()) || DEFAULT_GROQ_MODEL;

  if (!cleanKey) {
    sendJson(res, 400, {
      error: 'Groq API Key is missing. Please enter your Groq API key (gsk_...) manually.',
    });
    return;
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    sendJson(res, 400, { error: 'Prompt is required.' });
    return;
  }

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (typeof systemInstruction === 'string' && systemInstruction.trim()) {
    messages.push({ role: 'system', content: systemInstruction.trim() });
  }
  messages.push({ role: 'user', content: prompt });

  const payload: Record<string, unknown> = {
    model: cleanModel,
    messages,
    temperature: typeof temperature === 'number' && !Number.isNaN(temperature) ? temperature : 0.7,
    max_tokens: typeof maxTokens === 'number' && !Number.isNaN(maxTokens) ? maxTokens : 8192,
    stream: Boolean(stream),
  };

  try {
    const upstream = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errorData = await upstream.json().catch(() => null);
      const errMsg = errorData?.error?.message || upstream.statusText || `Groq API error (${upstream.status})`;
      sendJson(res, upstream.status, { error: errMsg });
      return;
    }

    if (stream && upstream.body) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let hasText = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const chunkPayload = trimmed.slice(6).trim();
          if (chunkPayload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(chunkPayload);
            const deltaText = parsed?.choices?.[0]?.delta?.content || '';
            if (deltaText) {
              hasText = true;
              res.write(`data: ${JSON.stringify({ text: deltaText })}\n\n`);
            }
          } catch {
            // ignore partial JSON chunks
          }
        }
      }

      if (!hasText) {
        res.write(`data: ${JSON.stringify({ error: 'Groq returned an empty streamed response.' })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      sendJson(res, 502, { error: 'Groq returned an empty response. Please try again.' });
      return;
    }
    sendJson(res, 200, { text });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      sendJson(res, 500, { error: errMsg });
    }
  }
}
