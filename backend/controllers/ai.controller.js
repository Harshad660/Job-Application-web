import { createRequire } from "module";
import { callAI } from "../services/ai.service.js";
import { Chat } from "../models/chat.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

function extractJSON(text) {
  try {
    const clean = String(text || "")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return JSON.parse(match ? match[0] : clean);
  } catch {
    throw new Error("Invalid JSON from AI response");
  }
}

export const testAI = async (_req, res) => {
  try {
    const result = await callAI("Say hello in one short sentence.");
    return res.json({ success: true, result });
  } catch (err) {
    console.error("[testAI ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "AI test failed" });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    console.log("[/ai/chat] BODY:", req.body);
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ success: false, message: "Message required" });
    }

    const userId = req.id;
    const jobs = await Job.find({})
      .populate("company", "name")
      .select("title description requirements salary experienceLevel location jobType position company")
      .lean();

    const listings = jobs.length
      ? jobs
          .map(
            (j, i) => `Job ${i + 1}:
Title: ${j.title}
Company: ${j.company?.name || "N/A"}
Location: ${j.location}
Type: ${j.jobType}
Experience: ${j.experienceLevel} year(s)
Requirements: ${(j.requirements || []).join(", ")}
Description: ${(j.description || "").slice(0, 250)}`
          )
          .join("\n\n")
      : "No jobs available right now.";

    let chatHistory = await Chat.findOne({ userId });
    if (!chatHistory) chatHistory = new Chat({ userId, messages: [] });

    const prompt = `You are a professional career assistant for a job portal.
Use only real job listings below when discussing openings.

Job listings:
${listings}

Conversation so far:
${chatHistory.messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

User: ${message}
Assistant:`;

    const reply = await callAI(prompt);
    chatHistory.messages.push({ role: "user", content: message });
    chatHistory.messages.push({ role: "assistant", content: reply });
    await chatHistory.save();

    return res.json({ success: true, message: reply });
  } catch (err) {
    console.error("[chatWithAI ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "Chat failed" });
  }
};

// ─── 2. Chat History ───────────────────────────────────────────────────

export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.id });
    const messages = chat?.messages || [];
    if (!messages.length) {
      messages.push({ role: "assistant", content: "Hi! I am your AI Career Assistant." });
    }
    return res.json({ success: true, messages });
  } catch (err) {
    console.error("[getChatHistory ERROR]", err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
};

// ─── 3. ATS Resume Analyzer (FIXED) ────────────────────────────────────

export const analyzeResume = async (req, res) => {
  try {
    console.log("[/ai/analyze-resume] BODY:", req.body);
    console.log("[/ai/analyze-resume] FILE:", req.file?.originalname || "missing");
    const { jobDescription } = req.body || {};
    if (!req.file || !jobDescription) {
      return res.status(400).json({ success: false, message: "Resume PDF and job description are required" });
    }

    const parsedPdf = await pdfParse(req.file.buffer);
    const resumeText = parsedPdf?.text || "";
    const prompt = `Analyze this resume against this job description.
Return only valid JSON with this exact shape:
{
  "score": number,
  "matchingKeywords": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}

Job description:
${jobDescription}

Resume:
${resumeText}`;

    const raw = await callAI(prompt);
    const result = extractJSON(raw);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("[analyzeResume ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "ATS analysis failed" });
  }
};

// ─── 4. Job Recommendation ─────────────────────────────────────────────

export const recommendJobs = async (req, res) => {
  try {
    const user = await User.findById(req.id).lean();
    const jobs = await Job.find().limit(20).lean();

    const prompt = `Match this user profile to these jobs and return only a JSON array of top recommendations.
Each item should include: _id, title, company, location, jobType, matchReason.

User:
${JSON.stringify(user?.profile || {})}

Jobs:
${JSON.stringify(jobs)}`;

    const raw = await callAI(prompt);
    const parsed = extractJSON(raw);
    return res.json({ success: true, jobs: Array.isArray(parsed) ? parsed : [] });
  } catch (err) {
    console.error("[recommendJobs ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};

// ─── 5. Resume Builder ────────────────────────────────────────────────

export const buildResume = async (req, res) => {
  try {
    console.log("[/ai/build-resume] BODY:", req.body);
    const { personalInfo, skills, education, experience } = req.body || {};
    if (!personalInfo?.fullName) {
      return res.status(400).json({ success: false, message: "personalInfo.fullName is required" });
    }

    const prompt = `Generate a modern ATS-friendly resume from this input.
Return only JSON in this exact structure:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "" },
  "summary": "string",
  "skills": ["string"],
  "education": [{ "institution": "", "degree": "", "details": "" }],
  "experience": [{ "company": "", "role": "", "optimizedBullets": ["string"] }]
}

Input:
Personal Info: ${JSON.stringify(personalInfo || {})}
Skills: ${JSON.stringify(skills || "")}
Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}`;

    const raw = await callAI(prompt);
    const result = extractJSON(raw);
    return res.json({ success: true, resumeData: result });
  } catch (err) {
    console.error("[buildResume ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "Resume generation failed" });
  }
};

// ─── 6. Mock Interview ────────────────────────────────────────────────

export const generateMockInterview = async (req, res) => {
  try {
    console.log("[/ai/mock-interview] BODY:", req.body);
    const { jobRole, experienceLevel, transcript, questionIndex } = req.body || {};
    if (!jobRole || !experienceLevel) {
      return res.status(400).json({ success: false, message: "jobRole and experienceLevel are required" });
    }

    const prompt = transcript
      ? `You are a technical interviewer.
Role: ${jobRole}
Experience level: ${experienceLevel}
Candidate answer to question #${questionIndex}: "${transcript}"

Return only JSON:
{
  "feedback": "string",
  "score": number,
  "nextQuestion": "string"
}`
      : `You are a technical interviewer.
Start an interview for role "${jobRole}" with "${experienceLevel}" level.
Return only JSON:
{
  "nextQuestion": "string"
}`;

    const raw = await callAI(prompt);
    const result = extractJSON(raw);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("[generateMockInterview ERROR]", err?.response?.data || err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "Mock interview failed" });
  }
};