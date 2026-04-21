import React, { useEffect, useState } from 'react';
import Navbar from '../../shared/Navbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import { Trash2, CheckCircle, XCircle, Search, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

const getAuthConfig = () => ({
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
});

const ManageRecruiters = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchRecruiters = async () => {
        try {
            const res = await axios.get('/api/v1/admin/recruiters', getAuthConfig());
            if (res.data.success) {
                setRecruiters(res.data.recruiters);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const handleApproval = async (userId, status) => {
        try {
            const res = await axios.post(`/api/v1/admin/recruiters/approve/${userId}`, { status }, getAuthConfig());
            if (res.data.success) {
                toast.success(res.data.message);
                fetchRecruiters();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update recruiter status');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Delete this recruiter account?")) return;
        try {
            const res = await axios.delete(`/api/v1/admin/users/${userId}`, getAuthConfig());
            if (res.data.success) {
                toast.success(res.data.message);
                fetchRecruiters();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete recruiter');
        }
    };

    const filteredRecruiters = recruiters.filter(recruiter => 
        recruiter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        recruiter.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Recruiter Approvals</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Search recruiters..."
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
                                    <th className="px-6 py-4 font-semibold text-gray-700">Recruiter Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Contact</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">Loading recruiters...</td></tr>
                                ) : filteredRecruiters.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">No recruiters found</td></tr>
                                ) : filteredRecruiters.map((rec) => (
                                    <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{rec.fullName}</div>
                                            <div className="text-xs text-gray-400 mt-1">Joined: {new Date(rec.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-600">{rec.email}</div>
                                            <div className="text-sm text-gray-500">{rec.phoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.isApproved ? (
                                                <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                                                    <UserCheck size={16} /> Approved
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-500 text-sm font-semibold">
                                                    <UserX size={16} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {!rec.isApproved && (
                                                    <button 
                                                        onClick={() => handleApproval(rec._id, 'approve')}
                                                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
                                                        title="Approve Recruiter"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(rec._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                                                    title="Delete Recruiter"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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

export default ManageRecruiters;
