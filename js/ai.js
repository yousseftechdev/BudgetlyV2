const messagesContainer = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function formatAIResponse(response) {
  const formattedResponse = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  return formattedResponse.replace(/\n/g, "<br>");
}

async function fetchAIResponse(userMessage) {
  try {
    const response = await fetch("https://ai.hackclub.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI response");
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]?.message?.content) {
      return "Sorry, I couldn't understand that.";
    }

    return formatAIResponse(data.choices[0].message.content || "Sorry, I couldn't understand that.");
  } catch (error) {
    console.error(error);
    return "An error occurred while fetching the AI response.";
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  const userMessageEl = document.createElement("div");
  userMessageEl.className = "message user";
  userMessageEl.textContent = userMessage;
  messagesContainer.appendChild(userMessageEl);

  const aiMessageEl = document.createElement("div");
  aiMessageEl.className = "message ai";
  aiMessageEl.textContent = "Thinking...";
  messagesContainer.appendChild(aiMessageEl);

  const aiResponse = await fetchAIResponse(userMessage);
  aiMessageEl.innerHTML = aiResponse;

  userInput.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

function loadThemeState() {
  const cookies = document.cookie.split("; ");
  const match = cookies.find(c => c.startsWith("theme="));
  return match ? match.split("=")[1] : "dark";
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  document.body.style.setProperty("--background-color", isDark ? "#2f3640" : "#f5f6fa");
  document.body.style.setProperty("--text-color", isDark ? "#f5f6fa" : "#2f3640");
  document.body.style.setProperty("--primary-color", isDark ? "#273c75" : "#00a8ff");
  document.body.style.setProperty("--glass-bg", isDark ? "rgba(47, 54, 64, 0.7)" : "rgba(255, 255, 255, 0.7)");
  userInput.style.setProperty("color", isDark ? "#fff" : "#000");
}

applyTheme(loadThemeState() === "dark");