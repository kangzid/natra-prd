import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';

function isGemini4Model(model: string): boolean {
  return model.trim().toLowerCase().startsWith('gemini-4');
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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
      details: `Verify the model identifier (e.g., gemini-4-hydrogen, gemini-3.1-flash-lite, gemini-4-neon). Details: ${rawMessage}`,
    };
  }
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(rawMessage)) {
    return {
      status: 429,
      message: 'Rate limit or quota reached',
      details: rawMessage,
    };
  }
  return {
    status,
    message: 'Gemini API request failed',
    details: rawMessage,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Test user-supplied Gemini API key & model via @google/genai SDK
  app.post('/api/gemini/test', async (req, res) => {
    const { apiKey, model } = req.body || {};
    const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    const cleanModel = (typeof model === 'string' && model.trim()) || DEFAULT_GEMINI_MODEL;

    if (!cleanKey) {
      res.status(400).json({
        success: false,
        message: 'No API key provided',
        details: 'Please enter your Google Gemini API key manually in Settings or the Builder panel.',
      });
      return;
    }

    try {
      const ai = createGeminiClient(cleanKey);
      await ai.models.generateContent({
        model: cleanModel,
        contents: 'Ping test. Reply with: OK',
      });

      res.json({
        success: true,
        message: `Successfully connected to Google Gemini (${cleanModel})!`,
      });
    } catch (err: unknown) {
      const parsed = parseGeminiError(err, cleanModel);
      res.status(parsed.status).json({
        success: false,
        message: parsed.message,
        details: parsed.details,
      });
    }
  });

  // Generate or stream Markdown documentation via @google/genai SDK
  app.post('/api/gemini/generate', async (req, res) => {
    const { apiKey, model, prompt, systemInstruction, temperature, maxTokens, stream } = req.body || {};
    const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
    const cleanModel = (typeof model === 'string' && model.trim()) || DEFAULT_GEMINI_MODEL;

    if (!cleanKey) {
      res.status(400).json({
        error: 'Google Gemini API Key is missing. Please enter your API key manually in Settings or the Builder panel.',
      });
      return;
    }

    if (typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
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
        res.status(502).json({ error: 'Google Gemini returned an empty response. Please try again.' });
        return;
      }

      res.json({ text });
    } catch (err: unknown) {
      const parsed = parseGeminiError(err, cleanModel);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: `${parsed.message}: ${parsed.details}` })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        res.status(parsed.status).json({
          error: `${parsed.message}: ${parsed.details}`,
        });
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Natra Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
