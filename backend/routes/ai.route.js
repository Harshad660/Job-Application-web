import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import multer from 'multer';
import {
    chatWithAI,
    getChatHistory,
    analyzeResume,
    recommendJobs,
    buildResume,
    generateMockInterview,
} from '../controllers/ai.controller.js';

const router = express.Router();

// Multer: store files in memory so we can read the buffer directly
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
});

// ── AI Chatbot ──────────────────────────────────────────────────────────────
router.post('/chat', isAuthenticated, chatWithAI);
router.get('/chat-history', isAuthenticated, getChatHistory);

// ── Resume tools ────────────────────────────────────────────────────────────
router.post('/analyze-resume', isAuthenticated, upload.single('resume'), analyzeResume);
router.post('/build-resume', isAuthenticated, buildResume);

// ── Job recommendations ─────────────────────────────────────────────────────
router.get('/recommend-jobs', isAuthenticated, recommendJobs);

// ── Mock Interview ──────────────────────────────────────────────────────────
router.post('/mock-interview', isAuthenticated, generateMockInterview);

// ── Multer error handler ────────────────────────────────────────────────────
router.use((err, _req, res, _next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.', success: false });
    }
    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({ message: err.message, success: false });
    }
    return res.status(500).json({ message: err.message || 'Upload error', success: false });
});

export default router;
