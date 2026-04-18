import React, { useEffect, useState } from 'react';
import Navbar from '../../shared/Navbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import { Search, Info, User, Briefcase, Clock } from 'lucide-react';

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchApplications = async () => {
        try {
            const res = await axios.get('/api/v1/admin/applications', { withCredentials: true });
            if (res.data.success) {
                setApplications(res.data.applications);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApps = applications.filter(app => 
        app.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.applicant?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'selected': return 'bg-green-100 text-green-600';
            case 'rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">All Applications</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Search by job or applicant..."
                                className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none w-80 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-bottom">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Applicant</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Job Title</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Applied Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">Loading applications...</td></tr>
                                ) : filteredApps.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">No applications found</td></tr>
                                ) : filteredApps.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{app.applicant?.fullName}</div>
                                                    <div className="text-xs text-gray-500">{app.applicant?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Briefcase size={16} className="text-gray-400" />
                                                {app.job?.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-400" />
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(app.status)}`}>
                                                {app.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManageApplications;
