import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";

export async function callAI(prompt) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }

    if (!prompt || !String(prompt).trim()) {
      throw new Error("Prompt is required");
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: String(prompt) }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid AI response shape from Groq");
    }

    return content;
  } catch (err) {
    console.error("[AI SERVICE ERROR]", err?.response?.data || err?.message || err);
    throw err;
  }
}
