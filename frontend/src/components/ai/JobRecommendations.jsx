import React, { useEffect, useState } from 'react';
import { Sparkles, MapPin, Building2, Briefcase, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance'; // ← shared instance

const JobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get('/ai/recommend-jobs');
            if (res.data.success) {
                let jobData = res.data.jobs;
                if (!Array.isArray(jobData) && jobData && typeof jobData === 'object') {
                    jobData = jobData.jobs || jobData.recommendedJobs || [];
                }
                setJobs(Array.isArray(jobData) ? jobData : []);
            }
        } catch (err) {
            console.error('Failed to fetch job recommendations:', err);
            // 401 means not logged in — silently hide the component
            if (err.response?.status !== 401) {
                setError('Could not load recommendations. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="py-10 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
                <p className="text-sm">AI is analysing your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 text-center text-gray-500">
                <p className="text-sm mb-3">{error}</p>
                <button
                    onClick={fetchRecommendations}
                    className="flex items-center gap-1 mx-auto text-purple-600 text-sm font-medium hover:text-purple-700"
                >
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        );
    }

    if (jobs.length === 0) return null;

    return (
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                AI Recommended For You
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div
                        key={job._id}
                        onClick={() => navigate(`/description/${job._id}`)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all group overflow-hidden relative cursor-pointer"
                    >
                        {/* Hover accent bar */}
                        <div className="absolute top-0 left-0 w-1 bg-purple-600 h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base line-clamp-1">{job.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="w-3 h-3 flex-shrink-0" />
                                    <span className="line-clamp-1">{job.company?.name || 'Unknown Company'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
                                <Briefcase className="w-3 h-3" /> {job.jobType || 'Full-time'}
                            </span>
                        </div>

                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 mb-1">
                                AI Match Reason
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 line-clamp-2">
                                {job.matchReason}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobRecommendations;
