import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PlayCircle, RefreshCw, Star, ArrowRight } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance'; // ← shared instance

const MAX_QUESTIONS = 5;

const MockInterview = () => {
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [experienceLevel, setExperienceLevel] = useState('Entry-level');

    const [hasStarted, setHasStarted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [question, setQuestion] = useState('');
    const [questionIndex, setQuestionIndex] = useState(1);

    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');

    const [feedbackLog, setFeedbackLog] = useState([]);
    const [isFinished, setIsFinished] = useState(false);

    const recognitionRef = useRef(null);

    // ── Speech Recognition setup ─────────────────────────────────────────────
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const recognition = new SR();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                }
                if (final) setTranscript(prev => (prev + ' ' + final).trim());
            };

            recognition.onerror = (e) => {
                console.error('Speech recognition error:', e.error);
                setIsRecording(false);
            };

            recognition.onend = () => setIsRecording(false);

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Your browser doesn't support speech recognition. Please type your answer.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    // ── API calls ─────────────────────────────────────────────────────────────

    const startInterview = async () => {
        if (!jobRole.trim()) {
            toast.error('Please enter a job role.');
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post('/ai/mock-interview', {
                jobRole, experienceLevel, questionIndex: 1,
            });
            if (res.data.success) {
                setQuestion(res.data.data.nextQuestion);
                setHasStarted(true);
                setQuestionIndex(1);
                setFeedbackLog([]);
                setTranscript('');
                setIsFinished(false);
            }
        } catch (error) {
            console.error('startInterview error:', error);
            if (error.response?.status === 401) {
                toast.error('Please log in to start a mock interview.');
            } else {
                toast.error('Failed to start interview. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!transcript.trim()) {
            toast.error('Please provide an answer before submitting.');
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post('/ai/mock-interview', {
                jobRole, experienceLevel, transcript, questionIndex,
            });

            if (res.data.success) {
                const { feedback, score, nextQuestion } = res.data.data;

                setFeedbackLog(prev => [...prev, { q: question, a: transcript, feedback, score }]);

                if (questionIndex >= MAX_QUESTIONS) {
                    setIsFinished(true);
                } else {
                    setQuestion(nextQuestion);
                    setQuestionIndex(prev => prev + 1);
                    setTranscript('');
                }
            }
        } catch (error) {
            console.error('submitAnswer error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit answer.');
        } finally {
            setLoading(false);
        }
    };

    const resetInterview = () => {
        setHasStarted(false);
        setIsFinished(false);
        setFeedbackLog([]);
        setTranscript('');
        setQuestion('');
        setQuestionIndex(1);
    };

    // ── Average score helper ──────────────────────────────────────────────────
    const avgScore = feedbackLog.length
        ? Math.round(feedbackLog.reduce((s, l) => s + (l.score || 0), 0) / feedbackLog.length)
        : 0;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-12">

                {/* ── Setup Screen ── */}
                {!hasStarted && !isFinished && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-xl mx-auto text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center">
                            <PlayCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold">AI Mock Interview</h2>
                        <p className="text-gray-500">
                            Practice {MAX_QUESTIONS} questions tailored to your target role and experience level.
                        </p>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="font-semibold block mb-1">Target Job Role</label>
                                <input
                                    type="text"
                                    value={jobRole}
                                    onChange={e => setJobRole(e.target.value)}
                                    className="w-full border dark:border-gray-700 bg-transparent p-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-sm"
                                    placeholder="e.g. Frontend Developer"
                                />
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Experience Level</label>
                                <select
                                    value={experienceLevel}
                                    onChange={e => setExperienceLevel(e.target.value)}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none text-sm"
                                >
                                    <option value="Entry-level">Entry-level (0–2 years)</option>
                                    <option value="Mid-level">Mid-level (3–5 years)</option>
                                    <option value="Senior-level">Senior-level (6+ years)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={startInterview}
                            disabled={loading || !jobRole.trim()}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                        >
                            {loading ? 'Preparing your interview...' : 'Start Interview'}
                        </button>
                    </div>
                )}

                {/* ── Results Screen ── */}
                {isFinished && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-8 animate-in zoom-in-95">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                Interview Complete!
                            </h2>
                            <p className="text-gray-500">
                                Average Score: <span className="font-bold text-yellow-500">{avgScore}/10</span>
                            </p>
                        </div>

                        <div className="space-y-5">
                            {feedbackLog.map((log, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3"
                                >
                                    <h4 className="font-semibold text-base flex items-start gap-2">
                                        <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded text-sm">
                                            Q{idx + 1}
                                        </span>
                                        {log.q}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700 text-sm">
                                        "{log.a}"
                                    </p>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center text-yellow-500 min-w-[48px]">
                                            <span className="text-2xl font-bold">{log.score}</span>
                                            <span className="text-xs">/10</span>
                                            <Star className="w-4 h-4 fill-yellow-500 mt-0.5" />
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-900/30 flex-1">
                                            {log.feedback}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={resetInterview}
                            className="mx-auto block bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition"
                        >
                            Take Another Interview
                        </button>
                    </div>
                )}

                {/* ── Active Interview Screen ── */}
                {hasStarted && !isFinished && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-8 min-h-[500px] flex flex-col">

                        {/* Progress */}
                        <div className="flex justify-between items-center text-sm font-semibold text-gray-500 border-b dark:border-gray-700 pb-4">
                            <span>Question {questionIndex} of {MAX_QUESTIONS}</span>
                            <span>{jobRole} · {experienceLevel}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${((questionIndex - 1) / MAX_QUESTIONS) * 100}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="flex-1 flex flex-col justify-center text-center">
                            <h3 className="text-2xl font-bold leading-relaxed">{question}</h3>
                        </div>

                        {/* Answer input */}
                        <div className="space-y-4">
                            <div className="relative">
                                <textarea
                                    value={transcript}
                                    onChange={e => setTranscript(e.target.value)}
                                    placeholder="Type your answer here, or use the microphone to speak..."
                                    rows="5"
                                    disabled={loading}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 pr-16 focus:ring-2 focus:ring-purple-600 outline-none resize-none text-sm disabled:opacity-60"
                                />
                                <button
                                    onClick={toggleRecording}
                                    disabled={loading}
                                    title={isRecording ? 'Stop recording' : 'Start recording'}
                                    className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all disabled:opacity-50
                                        ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            </div>

                            <button
                                onClick={submitAnswer}
                                disabled={loading || !transcript.trim()}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Analysing your answer...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer & Continue <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterview;
