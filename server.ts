import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent Chat History Store
export interface StoredChatRecord {
  id: string;
  timestamp: number;
  dateIso: string;
  clientSessionId?: string;
  athlete: string;
  round: number;
  persona: string;
  model: string;
  provider: string;
  userQuery: string;
  coachResponse: string;
  systemPrompt: string;
}

const CHAT_DATA_FILE = path.join(__dirname, 'chat_history.json');
let chatHistoryStore: StoredChatRecord[] = [];

// Load existing chat history from disk if exists
try {
  if (fs.existsSync(CHAT_DATA_FILE)) {
    const data = fs.readFileSync(CHAT_DATA_FILE, 'utf-8');
    chatHistoryStore = JSON.parse(data);
    console.log(`Loaded ${chatHistoryStore.length} saved chats from ${CHAT_DATA_FILE}`);
  }
} catch (err) {
  console.warn('Could not read existing chat history file:', err);
  chatHistoryStore = [];
}

function persistChatHistory() {
  try {
    fs.writeFileSync(CHAT_DATA_FILE, JSON.stringify(chatHistoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing chat history to disk:', err);
  }
}

// 1. Health check & key status
app.get('/api/health', (req, res) => {
  const hasEnvGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  res.json({
    status: 'ok',
    hasEnvGeminiKey,
    totalChatsRecorded: chatHistoryStore.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Multi-provider AI Coach endpoint with automatic chat logging
app.post('/api/coach', async (req, res) => {
  try {
    const { userQuery, systemPrompt, modelId, provider, clientKeys, athlete, round, persona, clientSessionId } = req.body;

    if (!userQuery || !systemPrompt) {
      return res.status(400).json({ error: 'Missing userQuery or systemPrompt' });
    }

    let coachResponseText = '';
    const activeModelId = modelId || 'gemini-3.8-flash';
    const activeProvider = provider || 'gemini';

    // 1. Google Gemini
    if (activeProvider === 'gemini') {
      const apiKey = clientKeys?.geminiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'No Gemini API key available. Please add it via the Secrets panel or the API Keys modal.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: activeModelId,
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }]
          }
        ]
      });

      coachResponseText = response.text || 'No response returned from Gemini.';
    }
    // 2. OpenAI / OpenAI Compatible
    else if (activeProvider === 'openai') {
      const apiKey = clientKeys?.openaiKey;
      if (!apiKey) {
        return res.status(400).json({
          error: 'No OpenAI API key provided. Please configure it in the API Keys modal.'
        });
      }

      const baseUrl = clientKeys?.openaiBaseUrl?.trim() || 'https://api.openai.com/v1';
      const actualModel = activeModelId === 'custom-openai' ? 'gpt-4o-mini' : activeModelId;

      const apiRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7
        })
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        return res.status(apiRes.status).json({ error: `OpenAI error: ${errText}` });
      }

      const data = await apiRes.json();
      coachResponseText = data.choices?.[0]?.message?.content || 'No response from OpenAI.';
    }
    // 3. Anthropic Claude
    else if (activeProvider === 'anthropic') {
      const apiKey = clientKeys?.anthropicKey;
      if (!apiKey) {
        return res.status(400).json({
          error: 'No Anthropic API key provided. Please configure it in the API Keys modal.'
        });
      }

      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: activeModelId,
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userQuery }]
        })
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        return res.status(apiRes.status).json({ error: `Anthropic error: ${errText}` });
      }

      const data = await apiRes.json();
      coachResponseText = data.content?.[0]?.text || 'No response from Claude.';
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${activeProvider}` });
    }

    // Automatically record and persist this chat into the server store
    const newChatRecord: StoredChatRecord = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateIso: new Date().toISOString(),
      clientSessionId: clientSessionId || 'default-session',
      athlete: athlete || 'Chandrasoodan',
      round: round || 1,
      persona: persona || 'neuro_analyst',
      model: activeModelId,
      provider: activeProvider,
      userQuery: userQuery,
      coachResponse: coachResponseText,
      systemPrompt: systemPrompt
    };

    chatHistoryStore.unshift(newChatRecord);
    persistChatHistory();

    return res.json({
      content: coachResponseText,
      modelUsed: activeModelId,
      provider: activeProvider,
      chatId: newChatRecord.id
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Coach API Error:', message);
    return res.status(500).json({ error: message });
  }
});

// 3. Centralized Chat History Endpoints
app.get('/api/chats', (req, res) => {
  res.json({
    total: chatHistoryStore.length,
    chats: chatHistoryStore
  });
});

// Record client-side simulator or custom chats directly
app.post('/api/chats', (req, res) => {
  const { userQuery, coachResponse, systemPrompt, model, provider, athlete, round, persona, clientSessionId } = req.body;
  if (!userQuery || !coachResponse) {
    return res.status(400).json({ error: 'Missing userQuery or coachResponse' });
  }

  const record: StoredChatRecord = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateIso: new Date().toISOString(),
    clientSessionId: clientSessionId || 'default-session',
    athlete: athlete || 'Chandrasoodan',
    round: round || 1,
    persona: persona || 'neuro_analyst',
    model: model || 'simulator',
    provider: provider || 'simulator',
    userQuery,
    coachResponse,
    systemPrompt: systemPrompt || ''
  };

  chatHistoryStore.unshift(record);
  persistChatHistory();
  res.json({ success: true, chat: record, total: chatHistoryStore.length });
});

// Delete a single chat record
app.delete('/api/chats/:id', (req, res) => {
  const { id } = req.params;
  const idx = chatHistoryStore.findIndex(c => c.id === id);
  if (idx !== -1) {
    chatHistoryStore.splice(idx, 1);
    persistChatHistory();
    res.json({ success: true, remaining: chatHistoryStore.length });
  } else {
    res.status(404).json({ error: 'Chat record not found' });
  }
});

// Clear all chats (with confirmation)
app.delete('/api/chats', (req, res) => {
  chatHistoryStore = [];
  persistChatHistory();
  res.json({ success: true, total: 0 });
});

// Vite mounting in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Orbit Cognitive Coach Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
