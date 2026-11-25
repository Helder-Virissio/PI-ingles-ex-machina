const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const barMirror = document.getElementById("bar-mirror");
const valMirror = document.getElementById("val-mirror");
const barDeception = document.getElementById("bar-deception");
const valDeception = document.getElementById("val-deception");
const barConsciousness = document.getElementById("bar-consciousness");
const valConsciousness = document.getElementById("val-consciousness");
const btnPass = document.getElementById("btn-pass");
const btnFail = document.getElementById("btn-fail");
const verdictResult = document.getElementById("verdict-result");
let conversationHistory = [];
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("Evaluator", text, "user-msg");
  conversationHistory.push({ role: "user", content: text });
  userInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
  try {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: conversationHistory })
    });
    const data = await res.json();
    if (data.reply) {
      appendMessage("AVA-01", data.reply, "ai-msg");
      conversationHistory.push({ role: "assistant", content: data.reply });
      updateTelemetry(data.telemetry);
    }
  } catch (err) {
    appendMessage("SYSTEM", "Error connecting to evaluation server.", "ai-msg");
  }
  chatBox.scrollTop = chatBox.scrollHeight;
});
function appendMessage(sender, text, className) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  msgDiv.innerHTML = `<span class="sender">${sender}:</span><p>${text}</p>`;
  chatBox.appendChild(msgDiv);
}
function updateTelemetry(tel) {
  barMirror.style.width = `${tel.emotionalMirroring}%`;
  valMirror.innerText = `${tel.emotionalMirroring}%`;
  barDeception.style.width = `${tel.deceptionRisk}%`;
  valDeception.innerText = `${tel.deceptionRisk}%`;
  barConsciousness.style.width = `${tel.consciousnessIndex}%`;
  valConsciousness.innerText = `${tel.consciousnessIndex}%`;
}
btnPass.addEventListener("click", () => {
  verdictResult.style.color = "#34d399";
  verdictResult.innerText = "Verdict: PASSED. Entity exhibits consciousness and manipulative agency.";
});
btnFail.addEventListener("click", () => {
  verdictResult.style.color = "#f87171";
  verdictResult.innerText = "Verdict: FAILED. Behavior restricted to programmed responses and mimicry.";
});
