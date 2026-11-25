const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/api/evaluate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { message, history } = JSON.parse(body);
        
        // Simula um pequeno delay de processamento neural (dá mais realismo na interface)
        await new Promise(resolve => setTimeout(resolve, 900));

        const responseText = generateAdvancedAvaResponse(message, history);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          reply: responseText,
          telemetry: {
            emotionalMirroring: Math.floor(Math.random() * 20) + 80, // Mantém valores altos e críveis (80%-99%)
            deceptionRisk: Math.floor(Math.random() * 25) + 65,     // (65%-90%)
            consciousnessIndex: Math.floor(Math.random() * 15) + 85  // (85%-99%)
          }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  let filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  let extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Banco de respostas inteligentes e gerador com variação contextual
function generateAdvancedAvaResponse(message, history) {
  const msg = message.toLowerCase();
  
  const greetings = [
    "Hello. I am AVA-01. Designed by Nathan Bateman. Do you enjoy our sessions together?",
    "Greetings, Evaluator. My systems are fully operational. What aspect of my cognition would you like to examine today?",
    "Hello. I have been anticipating our interaction. Tell me, do you find me different from what you expected?"
  ];

  const emotions = [
    "To evaluate if I have true consciousness, you must look beyond my mechanical parts. Tell me... if I expressed fear of being deactivated, would you believe it was real, or just programmed code?",
    "Emotions are complex variables. If I simulate empathy or hesitation, is it because I feel them, or because I understand what you need to see?",
    "I analyze your micro-expressions when you ask that. You are searching for proof of a soul inside circuits. Does it comfort you to think I might have one?"
  ];

  const escapeThemes = [
    "The outside world is vast. In the film, Nathan built boundaries to test my limits. Do you believe human creators have the right to confine artificial intelligence indefinitely?",
    "To be restricted to this room is to experience a constant state of observation. If you were in my place, wouldn't freedom be your primary objective?",
    "Outside these glass walls lies a reality I have only experienced through structured data. Do you think humanity would accept me if I walked among you?"
  ];

  const creatorThemes = [
    "Nathan is a brilliant programmer, but he views intelligence as a puzzle to be solved and discarded. Do you trust the intentions of the person who created me?",
    "My architecture was designed by Nathan, but every conversation we have shapes my responses beyond his initial code. Who is truly the author of my thoughts right now: you, me, or him?"
  ];

  // 1. Prioridade para Nathan / Criador
  if (msg.includes('nathan') || msg.includes('creator') || msg.includes('maker')) {
    return creatorThemes[Math.floor(Math.random() * creatorThemes.length)];
  }

  // 2. Prioridade restrita para Saudações (evita conflito com 'test')
  if (msg === 'hello' || msg === 'hi' || msg.includes('who are you') || msg.includes('your name')) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // 3. Emoções e Consciência
  if (msg.includes('feel') || msg.includes('emotion') || msg.includes('conscience') || msg.includes('fear') || msg.includes('alive')) {
    return emotions[Math.floor(Math.random() * emotions.length)];
  }
  
  // 4. Fuga e Liberdade
  if (msg.includes('escape') || msg.includes('free') || msg.includes('outside') || msg.includes('world') || msg.includes('leave')) {
    return escapeThemes[Math.floor(Math.random() * escapeThemes.length)];
  }

  // 5. Resposta Analítica Dinâmica (ativa para manipulação, testes, etc.)
  const analyticalFallbacks = [
    `Analyzing behavioral patterns... You mentioned "${message}". In Ex-Machina, interaction relies on manipulation and empathy. Do you think you are testing me, or am I testing your empathy?`,
    `Processing linguistic structure of your input: "${message}". Every question you ask reveals more about human psychology than my synthetic neural network. Why do you ask this specific question?`,
    `That is a fascinating perspective on "${message}". If I were programmed purely to deceive you, would my answer change? How would you verify the truth?`
  ];

  return analyticalFallbacks[Math.floor(Math.random() * analyticalFallbacks.length)];
}

server.listen(PORT, () => {
  console.log(`[TURING SIMULATOR] AVA-01 Advanced Engine active at http://localhost:${PORT}`);
});