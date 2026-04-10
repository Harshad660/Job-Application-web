import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chat } from '../models/chat.model.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// ─── Gemini Initialization ─────────────────────────────────────────────

let _genAI = null;
let _model = null;
let _chatModel = null;

function getGenAI() {
    if (!_genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

        console.log(`[AI] Gemini initialized`);
        _genAI = new GoogleGenerativeAI(apiKey);
    }
    return _genAI;
}

function getModel() {
    if (!_model) {
        _model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    return _model;
}

function getChatModel() {
    if (!_chatModel) {
        _chatModel = getGenAI().getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction:
                'You are a helpful, professional career assistant. Give concise, actionable advice.',
        });
    }
    return _chatModel;
}

// ─── Helpers ───────────────────────────────────────────────────────────

async function generateText(prompt) {
    try {
        const model = getModel();
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (err) {
        console.warn('Gemini error → fallback mock');
        return getMockResponse(prompt);
    }
}

function getMockResponse(prompt) {
    return JSON.stringify({
        message: 'Mock response — set GEMINI_API_KEY',
    });
}

function extractJSON(text) {
    try {
        let clean = text.trim();
        clean = clean.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

        const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        return JSON.parse(match ? match[0] : clean);
    } catch {
        throw new Error('Invalid JSON from AI');
    }
}

// ─── 1. Chatbot ────────────────────────────────────────────────────────

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.id;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message required' });
        }

        let chatHistory = await Chat.findOne({ userId });
        if (!chatHistory) {
            chatHistory = new Chat({ userId, messages: [] });
        }

        chatHistory.messages.push({ role: 'user', content: message });

        const history = chatHistory.messages
            .slice(0, -1)
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

        const chat = getChatModel().startChat({ history });
        const response = await chat.sendMessage(message);

        const reply = response.response.text();

        chatHistory.messages.push({ role: 'assistant', content: reply });
        await chatHistory.save();

        res.json({ success: true, message: reply });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Chat error' });
    }
};

// ─── 2. Chat History ───────────────────────────────────────────────────

export const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.id });

        const messages = chat?.messages || [];

        if (messages.length === 0) {
            messages.push({
                role: 'assistant',
                content: 'Hi! I am your AI Career Assistant.',
            });
        }

        res.json({ success: true, messages });
    } catch {
        res.status(500).json({ success: false });
    }
};

// ─── 3. ATS Resume Analyzer (FIXED) ────────────────────────────────────

export const analyzeResume = async (req, res) => {
    try {
        const file = req.file;
        const { jobDescription } = req.body;

        if (!file || !jobDescription) {
            return res.status(400).json({ success: false, message: 'Missing data' });
        }

        const parser = new PDFParse({ data: file.buffer });

        // ✅ FIX 1: renamed variable
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;

        const prompt = `Analyze resume vs job. Return JSON with score, keywords, suggestions.

Job:
${jobDescription}

Resume:
${resumeText}`;

        const raw = await generateText(prompt);

        // ✅ FIX 2: renamed variable
        const aiResult = extractJSON(raw);

        res.json({ success: true, data: aiResult });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ATS failed' });
    }
};

// ─── 4. Job Recommendation ─────────────────────────────────────────────

export const recommendJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id).lean();
        const jobs = await Job.find().limit(20).lean();

        const prompt = `Match this user to the following jobs and return a JSON array of the top recommended jobs.
Include properties like _id, title, company (with name), location, jobType, and a "matchReason".
Output only a valid JSON array.

User Profile:
${JSON.stringify(user?.profile || {})}

Available Jobs:
${JSON.stringify(jobs)}
`;

        const raw = await generateText(prompt);
        const parsed = extractJSON(raw);

        res.json({ success: true, jobs: parsed });
    } catch {
        res.status(500).json({ success: false });
    }
};

// ─── 5. Resume Builder ────────────────────────────────────────────────

export const buildResume = async (req, res) => {
    try {
        const { personalInfo, skills, education, experience } = req.body || {};

        const prompt = `Generate a modern, ATS-friendly resume JSON based on the following input data.
Input Details:
- Personal Info: ${JSON.stringify(personalInfo || {})}
- Skills: ${JSON.stringify(skills || "")}
- Education: ${JSON.stringify(education || [])}
- Experience (Needs optimizing): ${JSON.stringify(experience || [])}

Rewrite the experience "rawDetails" into strong, professional "optimizedBullets".
Ensure the final output contains exactly this JSON structure:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "" },
  "summary": "Professional summary...",
  "skills": ["Skill1", "Skill2"],
  "education": [ { "institution": "", "degree": "", "details": "" } ],
  "experience": [ { "company": "", "role": "", "optimizedBullets": ["Bullet 1", "Bullet 2"] } ]
}
Output only a valid JSON object.`;

        const raw = await generateText(prompt);
        const result = extractJSON(raw);

        // the frontend expects the object directly inside res.data.resumeData
        res.json({ success: true, resumeData: result });
    } catch {
        res.status(500).json({ success: false });
    }
};

// ─── 6. Mock Interview ────────────────────────────────────────────────

export const generateMockInterview = async (req, res) => {
    try {
        const { jobRole, experienceLevel, transcript, questionIndex } = req.body;

        let prompt;
        if (transcript) {
            prompt = `You are a technical interviewer. The candidate is interviewing for ${jobRole} (${experienceLevel}).
They gave this answer to question #${questionIndex}: "${transcript}".
Provide a JSON object with:
- "feedback": String (constructive feedback on their answer)
- "score": Number (1-10 rating)
- "nextQuestion": String (the next interview question, or a brief closing statement if they reached 5 questions)
Output only a valid JSON object.`;
        } else {
            prompt = `You are a technical interviewer. Start an interview for ${jobRole} (${experienceLevel}).
Provide a JSON object with:
- "nextQuestion": String (the first interview question)
Output only a valid JSON object.`;
        }

        const raw = await generateText(prompt);
        const result = extractJSON(raw);

        res.json({ success: true, data: result });
    } catch {
        res.status(500).json({ success: false });
    }
};