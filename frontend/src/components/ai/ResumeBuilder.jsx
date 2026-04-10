import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash2, Printer, Loader2, Sparkles } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance'; // ← shared instance

const ResumeBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [personalInfo, setPersonalInfo] = useState({
        fullName: '', email: '', phone: '', linkedin: '',
    });
    const [skills, setSkills] = useState('');
    const [education, setEducation] = useState([{ institution: '', degree: '', year: '' }]);
    const [experience, setExperience] = useState([{ company: '', role: '', rawDetails: '' }]);

    const printRef = useRef();

    // ── Handlers ──────────────────────────────────────────────────────────────

    const addEducation = () =>
        setEducation(prev => [...prev, { institution: '', degree: '', year: '' }]);

    const removeEducation = (idx) =>
        setEducation(prev => prev.filter((_, i) => i !== idx));

    const addExperience = () =>
        setExperience(prev => [...prev, { company: '', role: '', rawDetails: '' }]);

    const removeExperience = (idx) =>
        setExperience(prev => prev.filter((_, i) => i !== idx));

    const updateExp = (idx, field, value) =>
        setExperience(prev => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));

    const updateEdu = (idx, field, value) =>
        setEducation(prev => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));

    const handleGenerate = async () => {
        if (!personalInfo.fullName.trim()) {
            toast.error('Please enter your full name.');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post('/ai/build-resume', {
                personalInfo,
                skills,
                education,
                experience,
            });

            if (res.data.success) {
                setResult(res.data.resumeData);
                toast.success('Resume optimised successfully!');
            }
        } catch (error) {
            console.error('buildResume error:', error);
            if (error.response?.status === 401) {
                toast.error('Please log in to generate a resume.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to generate resume.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!printRef.current) return;
        const printWindow = window.open('', '', 'width=800,height=900');
        printWindow.document.write(`
            <html>
            <head>
                <title>${result?.personalInfo?.fullName || 'Resume'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Georgia, serif; padding: 32px; font-size: 14px; color: #111; line-height: 1.6; }
                    h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
                    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 20px 0 10px; }
                    h3 { font-size: 14px; }
                    ul { padding-left: 20px; }
                    li { margin-bottom: 4px; }
                    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
                    .sub { font-size: 12px; color: #444; }
                    .flex-row { display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>${printRef.current.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    // ── UI ────────────────────────────────────────────────────────────────────

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">

                {/* ── Form ── */}
                <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="text-purple-600" /> Smart Resume Builder
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            Provide rough details — AI will rewrite them into polished, professional bullet points.
                        </p>
                    </div>

                    {/* Personal Info */}
                    <section className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Personal Info</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['Full Name', 'fullName', 'text'],
                                ['Email', 'email', 'email'],
                                ['Phone', 'phone', 'text'],
                                ['LinkedIn URL', 'linkedin', 'url'],
                            ].map(([label, key, type]) => (
                                <input
                                    key={key}
                                    type={type}
                                    placeholder={label}
                                    className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                    value={personalInfo[key]}
                                    onChange={e => setPersonalInfo(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Skills</h3>
                        <textarea
                            placeholder="e.g. React, Node.js, Python, Leadership (comma separated)"
                            className="w-full border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none resize-none"
                            rows="3"
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                        />
                    </section>

                    {/* Experience */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-semibold text-lg">Experience</h3>
                            <button
                                onClick={addExperience}
                                className="text-sm flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700"
                            >
                                <Plus className="w-4 h-4" /> Add Job
                            </button>
                        </div>
                        {experience.map((exp, idx) => (
                            <div key={idx} className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg relative">
                                {experience.length > 1 && (
                                    <button
                                        onClick={() => removeExperience(idx)}
                                        className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                        value={exp.company}
                                        onChange={e => updateExp(idx, 'company', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Role / Title"
                                        className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                        value={exp.role}
                                        onChange={e => updateExp(idx, 'role', e.target.value)}
                                    />
                                </div>
                                <textarea
                                    placeholder="What did you do there? (rough notes — AI will polish it)"
                                    className="w-full border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none resize-none"
                                    rows="2"
                                    value={exp.rawDetails}
                                    onChange={e => updateExp(idx, 'rawDetails', e.target.value)}
                                />
                            </div>
                        ))}
                    </section>

                    {/* Education */}
                    <section className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-semibold text-lg">Education</h3>
                            <button
                                onClick={addEducation}
                                className="text-sm flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700"
                            >
                                <Plus className="w-4 h-4" /> Add Degree
                            </button>
                        </div>
                        {education.map((edu, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg relative">
                                {education.length > 1 && (
                                    <button
                                        onClick={() => removeEducation(idx)}
                                        className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <input
                                    type="text"
                                    placeholder="Institution"
                                    className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                    value={edu.institution}
                                    onChange={e => updateEdu(idx, 'institution', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Degree"
                                    className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                    value={edu.degree}
                                    onChange={e => updateEdu(idx, 'degree', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Year (e.g. 2024)"
                                    className="border dark:border-gray-600 p-2 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                                    value={edu.year}
                                    onChange={e => updateEdu(idx, 'year', e.target.value)}
                                />
                            </div>
                        ))}
                    </section>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg shadow transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'AI is rewriting your resume...' : 'Generate Pro Resume'}
                    </button>
                </div>

                {/* ── Preview ── */}
                <div className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[800px] flex flex-col relative text-gray-900 dark:text-gray-100">
                    <div className="absolute top-4 right-4 no-print">
                        <button
                            onClick={handlePrint}
                            disabled={!result}
                            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-80 disabled:opacity-40 transition-opacity"
                        >
                            <Printer className="w-4 h-4" /> Export PDF
                        </button>
                    </div>

                    {!result ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                            <FileText className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-center">Fill out the details and click Generate to see the AI magic.</p>
                        </div>
                    ) : (
                        <div ref={printRef} className="flex-1 font-serif text-[15px] leading-relaxed">
                            {/* Header */}
                            <div className="text-center border-b-2 border-gray-800 dark:border-gray-200 pb-4 mb-6">
                                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
                                    {result.personalInfo?.fullName || 'Your Name'}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {[result.personalInfo?.email, result.personalInfo?.phone, result.personalInfo?.linkedin]
                                        .filter(Boolean)
                                        .join(' | ')}
                                </p>
                            </div>

                            {/* Summary */}
                            {result.summary && (
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 mb-2">
                                        Professional Summary
                                    </h2>
                                    <p className="text-sm">{result.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {result.experience?.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 mb-3">
                                        Professional Experience
                                    </h2>
                                    {result.experience.map((exp, idx) => (
                                        <div key={idx} className="mb-4">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-base">{exp.role}</h3>
                                                <span className="font-semibold italic text-sm">{exp.company}</span>
                                            </div>
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                                {exp.optimizedBullets?.map((bullet, bIdx) => (
                                                    <li key={bIdx}>{bullet}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Education */}
                            {result.education?.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 mb-3">
                                        Education
                                    </h2>
                                    {result.education.map((edu, idx) => (
                                        <div key={idx} className="flex justify-between items-baseline mb-2">
                                            <div>
                                                <span className="font-bold">{edu.institution}</span>
                                                {edu.details && <span className="text-sm"> — {edu.details}</span>}
                                            </div>
                                            <span className="italic text-sm">{edu.degree}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills */}
                            {result.skills?.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 dark:border-gray-600 mb-2">
                                        Key Skills
                                    </h2>
                                    <p className="text-sm leading-relaxed">{result.skills.join(' | ')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
