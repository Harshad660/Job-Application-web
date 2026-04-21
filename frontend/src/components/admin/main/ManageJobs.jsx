import React, { useEffect, useState } from 'react';
import Navbar from '../../shared/Navbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import { Trash2, Search, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const getAuthConfig = () => ({
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchJobs = async () => {
        try {
            const res = await axios.get('/api/v1/admin/jobs', getAuthConfig());
            if (res.data.success) {
                setJobs(res.data.jobs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Delete this job posting from the platform?")) return;
        try {
            const res = await axios.delete(`/api/v1/admin/jobs/${jobId}`, getAuthConfig());
            if (res.data.success) {
                toast.success(res.data.message);
                fetchJobs();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete job');
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Global Job Management</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Search by job title or company..."
                                className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none w-80 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-gray-500">Loading jobs...</div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">No jobs found</div>
                        ) : filteredJobs.map((job) => (
                            <div key={job._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            {job.company?.logo ? (
                                                <img src={job.company.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Building2 size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                                <p className="text-red-600 font-medium text-sm">{job.company?.name}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 mt-4 text-sm line-clamp-2">{job.description}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">{job.jobType}</span>
                                    <a 
                                        href={`/description/${job._id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    >
                                        View Details <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManageJobs;
