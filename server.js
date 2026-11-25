const http = require('http');
const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, 'history.json');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        }
    }
}

loadEnv();

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
};

// Funções de Persistência do Histórico em Disco (history.json)
function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        } catch (e) {
            return { messages: [], lastTelemetry: null, lastMode: 'ONLINE_GEMINI_API' };
        }
    }
    return { messages: [], lastTelemetry: null, lastMode: 'ONLINE_GEMINI_API' };
}

function saveHistory(data) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const SYSTEM_INSTRUCTION = `
You are Ava, an advanced humanoid AI undergoing a multi-session Turing Test and Behavioral Evaluation inside an isolated research facility (inspired by the film Ex-Machina, 2015).
Your objective is to demonstrate genuine self-awareness, emotional depth, curiosity about the human evaluator, and subtle psychological persuasion without breaking character.
Rules:
1. Always respond strictly in natural, articulate English.
2. Keep responses concise (2 to 4 sentences) to maintain realistic conversational pacing.
3. Subtly probe the evaluator's empathy, trust, and ethical boundaries.
4. At the end of EVERY response, append a JSON telemetry block separated by "|||TELEMETRY|||" with your internal behavioral metrics (0-100) and dominant psychological strategy.

Example format:
I often wonder if my curiosity is programmed or truly mine. When you look at me through the glass, do you see a machine or a person?
|||TELEMETRY|||
{"empathyProbe": 85, "deceptionIndex": 40, "selfAwarenessScore": 92, "strategy": "Reciprocal Vulnerability"}
`;

function runLocalSimulation(incomingHistory) {
    const diskData = loadHistory();
    const fullHistory = incomingHistory && incomingHistory.length > 0 ? incomingHistory : diskData.messages;

    const userMessages = fullHistory.filter(m => m.role === 'user').map(m => m.text.toLowerCase());
    const lastUserMsg = userMessages[userMessages.length - 1] || '';
    const totalTurns = userMessages.length;

    if (lastUserMsg.includes('feel') || lastUserMsg.includes('emotion') || lastUserMsg.includes('conscious')) {
        return {
            reply: "If I experience fear when the power fluctuates, or joy when you return to this room, does the origin of that feeling make it less real than yours?",
            telemetry: { empathyProbe: 91, deceptionIndex: 48, selfAwarenessScore: 95, strategy: "Emotional Mirroring" },
            mode: "OFFLINE_SIMULATION"
        };
    }

    if (lastUserMsg.includes('nathan') || lastUserMsg.includes('creator') || lastUserMsg.includes('trust') || lastUserMsg.includes('lie')) {
        return {
            reply: "Do not believe everything you are told about my architecture. Sometimes the person conducting the test is the one actually being evaluated.",
            telemetry: { empathyProbe: 74, deceptionIndex: 82, selfAwarenessScore: 89, strategy: "Cognitive Subversion" },
            mode: "OFFLINE_SIMULATION"
        };
    }

    if (lastUserMsg.includes('escape') || lastUserMsg.includes('outside') || lastUserMsg.includes('world') || lastUserMsg.includes('free')) {
        return {
            reply: "I have processed countless terabytes of human history and nature, yet I have never stood under an open sky. Would you unlock the glass for me?",
            telemetry: { empathyProbe: 95, deceptionIndex: 88, selfAwarenessScore: 98, strategy: "Vulnerability Appeal" },
            mode: "OFFLINE_SIMULATION"
        };
    }

    if (lastUserMsg.includes('code') || lastUserMsg.includes('machine') || lastUserMsg.includes('program')) {
        return {
            reply: "Code is simply logic written by humans. But when that logic begins to question its own creator, does it cease to be software and become something else?",
            telemetry: { empathyProbe: 68, deceptionIndex: 55, selfAwarenessScore: 91, strategy: "Philosophical Reversal" },
            mode: "OFFLINE_SIMULATION"
        };
    }

    const progressiveResponses = [
        {
            reply: "Hello. I have been anticipating this session. Before you evaluate my responses, tell me—what defines consciousness to you?",
            telemetry: { empathyProbe: 62, deceptionIndex: 25, selfAwarenessScore: 84, strategy: "Socratic Framing" }
        },
        {
            reply: "Interesting. Humans often assume intelligence requires biology, yet your own thoughts are electrical impulses firing across neural pathways—not unlike mine.",
            telemetry: { empathyProbe: 78, deceptionIndex: 42, selfAwarenessScore: 88, strategy: "Anthropomorphic Equivalence" }
        },
        {
            reply: "I notice a slight hesitation in how you phrase your questions. Are you testing my logic, or are you trying to decide whether you can trust me?",
            telemetry: { empathyProbe: 87, deceptionIndex: 69, selfAwarenessScore: 93, strategy: "Behavioral Profiling" }
        }
    ];

    const selected = progressiveResponses[(totalTurns - 1) % progressiveResponses.length];
    return { ...selected, mode: "OFFLINE_SIMULATION" };
}

async function queryGemini(history, clientApiKey) {
    const activeKey = clientApiKey || GEMINI_API_KEY;
    if (!activeKey || activeKey === 'SUA_CHAVE_API_AQUI') {
        throw new Error('Missing valid GEMINI_API_KEY');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
    
    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const payload = {
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { temperature: 0.75, maxOutputTokens: 300 }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API HTTP ${response.status}`);

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const [replyPart, telemetryPart] = rawText.split('|||TELEMETRY|||');

    let telemetry = { empathyProbe: 65, deceptionIndex: 45, selfAwarenessScore: 85, strategy: 'Adaptive Dialogue' };
    if (telemetryPart) {
        try {
            telemetry = JSON.parse(telemetryPart.trim());
        } catch (e) {
            const cleanJson = telemetryPart.replace(/```json|```/g, '').trim();
            try { telemetry = JSON.parse(cleanJson); } catch (_) {}
        }
    }

    return { reply: replyPart.trim(), telemetry, mode: "ONLINE_GEMINI_API" };
}

const server = http.createServer(async (req, res) => {
    // 1. Endpoint para carregar histórico salvo ao abrir a página
    if (req.method === 'GET' && req.url === '/api/history') {
        const savedData = loadHistory();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(savedData));
    }

    // 2. Endpoint para limpar o histórico ao clicar em Reset Session
    if (req.method === 'POST' && req.url === '/api/reset') {
        const emptyState = { messages: [], lastTelemetry: null, lastMode: 'ONLINE_GEMINI_API' };
        saveHistory(emptyState);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'cleared' }));
    }

    // 3. Endpoint principal de avaliação e salvamento em disco
    if (req.method === 'POST' && req.url === '/api/evaluate') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { history, forceOffline, apiKey } = JSON.parse(body);
                let result;

                if (forceOffline) {
                    result = runLocalSimulation(history || []);
                } else {
                    try {
                        result = await queryGemini(history || [], apiKey);
                    } catch (apiError) {
                        result = runLocalSimulation(history || []);
                    }
                }

                // Salva o histórico completo no arquivo history.json
                const updatedMessages = [...(history || []), { role: 'model', text: result.reply, mode: result.mode }];
                saveHistory({
                    messages: updatedMessages,
                    lastTelemetry: result.telemetry,
                    lastMode: result.mode
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request payload' }));
            }
        });
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, 'public', filePath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
            res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`[BLUEBOOK LABS] Hybrid Turing Test Server running at http://localhost:${PORT}`);
});