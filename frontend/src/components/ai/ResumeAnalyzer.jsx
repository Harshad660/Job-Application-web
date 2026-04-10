import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Lightbulb, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from '../shared/Navbar';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance'; // ← shared instance

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type !== 'application/pdf') {
            toast.error('Only PDF files are supported.');
            return;
        }
        setFile(selected || null);
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast.error('Please upload your resume (PDF).');
            return;
        }
        if (!jobDescription.trim()) {
            toast.error('Please paste the job description.');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        setLoading(true);
        setResult(null);

        try {
            // Override Content-Type so axios sets the correct multipart boundary
            const res = await axiosInstance.post('/ai/analyze-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setResult(res.data.data);
                toast.success('Resume analyzed successfully!');
            }
        } catch (error) {
            console.error('analyzeResume error:', error);
            const msg = error.response?.data?.message || 'Failed to analyze resume.';
            if (error.response?.status === 401) {
                toast.error('Please log in to use the Resume Analyzer.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* ── Input ── */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                AI Resume Analyzer
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Upload your resume and paste the job description to get an ATS optimisation score.
                            </p>
                        </div>

                        {/* File upload */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                                ${file
                                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/10'
                                    : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <input
                                type="file"
                                id="resume"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="resume" className="cursor-pointer flex flex-col items-center">
                                {file ? (
                                    <FileText className="w-12 h-12 text-purple-500 mb-4" />
                                ) : (
                                    <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                                )}
                                <span className="font-semibold text-gray-700 dark:text-gray-200">
                                    {file ? file.name : 'Click to upload Resume (PDF only)'}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size 5 MB'}
                                </span>
                            </label>
                        </div>

                        {/* Job description */}
                        <div>
                            <label className="font-semibold block mb-2 text-gray-700 dark:text-gray-200">
                                Job Description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                rows={6}
                                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent rounded-lg p-3 focus:ring-2 focus:ring-purple-600 outline-none text-sm resize-none"
                                placeholder="Paste the job description here..."
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Resume against Job'
                            )}
                        </button>
                    </div>

                    {/* ── Results ── */}
                    <div className="flex-1">
                        {result ? (
                            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-6 shadow-xl animate-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold mb-6 text-center">Analysis Result</h3>

                                {/* Score donut */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-48 h-48 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Score', value: result.score },
                                                        { name: 'Gap', value: 100 - result.score },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    stroke="none"
                                                    animationBegin={0}
                                                    animationDuration={1200}
                                                >
                                                    <Cell fill={getScoreColor(result.score)} />
                                                    <Cell fill="#E5E7EB" className="dark:fill-gray-700" />
                                                </Pie>
                                                <Tooltip formatter={(value) => `${value}%`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span
                                                className="text-3xl font-bold"
                                                style={{ color: getScoreColor(result.score) }}
                                            >
                                                {result.score}%
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">ATS Match</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Matching */}
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-900/50">
                                        <h4 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-2 text-sm">
                                            <CheckCircle className="w-4 h-4" /> Matching Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.matchingKeywords?.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                            {!result.matchingKeywords?.length && (
                                                <span className="text-xs text-gray-500">None detected</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Missing */}
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
                                        <h4 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-2 text-sm">
                                            <AlertTriangle className="w-4 h-4" /> Missing Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords?.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                            {!result.missingKeywords?.length && (
                                                <span className="text-xs text-gray-500">None — great job!</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-900/50">
                                        <h4 className="flex items-center gap-2 font-semibold text-yellow-700 dark:text-yellow-400 mb-2 text-sm">
                                            <Lightbulb className="w-4 h-4" /> Improvement Suggestions
                                        </h4>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                            {result.suggestions?.map((sug, i) => <li key={i}>{sug}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 min-h-[400px]">
                                <UploadCloud className="w-16 h-16 opacity-20 mb-4" />
                                <p className="text-lg">Upload files to see analysis results</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;
