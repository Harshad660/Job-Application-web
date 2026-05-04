import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const FALLBACK_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_MODEL = process.env.GROQ_MODEL || FALLBACK_MODEL;

async function requestGroq(prompt, model) {
  return axios.post(
    GROQ_API_URL,
    {
      model,
      messages: [{ role: "user", content: String(prompt) }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );
}

export async function callAI(prompt) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }

    if (!prompt || !String(prompt).trim()) {
      throw new Error("Prompt is required");
    }

    let response;
    try {
      response = await requestGroq(prompt, DEFAULT_MODEL);
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === "model_decommissioned" && DEFAULT_MODEL !== FALLBACK_MODEL) {
        console.warn(`[AI SERVICE] Model '${DEFAULT_MODEL}' is decommissioned. Falling back to '${FALLBACK_MODEL}'.`);
        response = await requestGroq(prompt, FALLBACK_MODEL);
      } else {
        throw err;
      }
    }

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[AI SERVICE] Invalid response shape:", response?.data);
      throw new Error("Invalid AI response shape from Groq");
    }

    return content;
  } catch (err) {
    const errorMsg = err?.response?.data?.error?.message || err?.message || "Unknown AI error";
    console.error("[AI SERVICE ERROR]", {
      status: err?.response?.status,
      data: err?.response?.data,
      message: errorMsg,
    });
    throw new Error(errorMsg);
  }
}
