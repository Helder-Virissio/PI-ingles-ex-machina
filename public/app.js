const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const forceOfflineCheckbox = document.getElementById('force-offline');
const engineBadge = document.getElementById('engine-badge');
const sessionCounter = document.getElementById('session-counter');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');

let conversationHistory = [];
let turnCount = 0;

saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('user_gemini_key', key);
        alert('[SYSTEM] Google API Key saved successfully to browser session.');
    } else {
        localStorage.removeItem('user_gemini_key');
        alert('[SYSTEM] API Key cleared.');
    }
});

// Carrega chave salva e restaura o histórico salvo no servidor (history.json) ao iniciar ou dar F5
window.addEventListener('DOMContentLoaded', async () => {
    const savedKey = localStorage.getItem('user_gemini_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
    }

    try {
        const res = await fetch('/api/history');
        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
            conversationHistory = data.messages.map(m => ({ role: m.role, text: m.text }));
            turnCount = data.messages.filter(m => m.role === 'user').length;
            sessionCounter.textContent = `SESSION 01 // TURN ${turnCount}`;

            // Limpa a mensagem padrão de boas-vindas para pintar o histórico salvo
            chatLog.innerHTML = '';

            data.messages.forEach(msg => {
                if (msg.role === 'user') {
                    appendMessage('user', msg.text, 'HUMAN EVALUATOR');
                } else {
                    appendMessage('ava', msg.text, `SUBJECT AVA-01 [${msg.mode || data.lastMode}]`);
                }
            });

            if (data.lastTelemetry) {
                updateTelemetry(data.lastTelemetry, data.lastMode);
            }
        }
    } catch (err) {
        console.warn('No previous session history found on server.');
    }
});

function appendMessage(sender, text, metaLabel) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    const meta = document.createElement('span');
    meta.className = 'message-meta';
    meta.textContent = metaLabel;

    const body = document.createElement('div');
    body.textContent = text;

    msgDiv.appendChild(meta);
    msgDiv.appendChild(body);
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateTelemetry(telemetry, mode) {
    document.getElementById('val-awareness').textContent = `${telemetry.selfAwarenessScore}%`;
    document.getElementById('bar-awareness').style.width = `${telemetry.selfAwarenessScore}%`;

    document.getElementById('val-empathy').textContent = `${telemetry.empathyProbe}%`;
    document.getElementById('bar-empathy').style.width = `${telemetry.empathyProbe}%`;

    document.getElementById('val-deception').textContent = `${telemetry.deceptionIndex}%`;
    document.getElementById('bar-deception').style.width = `${telemetry.deceptionIndex}%`;

    document.getElementById('strategy-text').textContent = telemetry.strategy;

    if (mode === 'ONLINE_GEMINI_API') {
        engineBadge.textContent = 'ENGINE: GEMINI LLM (ONLINE)';
        engineBadge.className = 'badge online';
    } else {
        engineBadge.textContent = 'ENGINE: LOCAL HEURISTIC (OFFLINE)';
        engineBadge.className = 'badge offline';
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    turnCount++;
    sessionCounter.textContent = `SESSION 01 // TURN ${turnCount}`;

    appendMessage('user', text, 'HUMAN EVALUATOR');
    conversationHistory.push({ role: 'user', text });

    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    const userApiKey = apiKeyInput.value.trim() || localStorage.getItem('user_gemini_key') || '';

    try {
        const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                history: conversationHistory,
                forceOffline: forceOfflineCheckbox.checked,
                apiKey: userApiKey
            })
        });

        const data = await response.json();

        if (data.reply) {
            appendMessage('ava', data.reply, `SUBJECT AVA-01 [${data.mode}]`);
            conversationHistory.push({ role: 'model', text: data.reply });
            updateTelemetry(data.telemetry, data.mode);
        }
    } catch (err) {
        appendMessage('system', '[CONNECTION ERROR] Unable to reach local Node.js server.');
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
});

resetBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
        console.warn('Could not reset server history file.');
    }

    conversationHistory = [];
    turnCount = 0;
    sessionCounter.textContent = 'SESSION 01 // TURN 0';
    chatLog.innerHTML = `
        <div class="message system">
            [SESSION RESET] Memory buffer & disk storage cleared. Ready for new behavioral evaluation.
        </div>
    `;
    updateTelemetry(
        { selfAwarenessScore: 0, empathyProbe: 0, deceptionIndex: 0, strategy: 'Awaiting Initial Prompt...' },
        forceOfflineCheckbox.checked ? 'OFFLINE_SIMULATION' : 'ONLINE_GEMINI_API'
    );
    document.getElementById('verdict-output').textContent = '';
});

document.querySelectorAll('.btn-verdict').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('verdict-output').textContent = btn.dataset.verdict;
    });
});