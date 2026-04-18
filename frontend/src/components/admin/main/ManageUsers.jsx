import React, { useEffect, useState } from 'react';
import Navbar from '../../shared/Navbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import { Trash2, Ban, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/v1/admin/users', { withCredentials: true });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBlock = async (userId, isBlocked) => {
        try {
            const res = await axios.post(`/api/v1/admin/users/block/${userId}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await axios.delete(`/api/v1/admin/users/${userId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
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
                                    <th className="px-6 py-4 font-semibold text-gray-700">Full Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading users...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-500">No users found</td></tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.phoneNumber}</td>
                                        <td className="px-6 py-4">
                                            {user.isBlocked ? (
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">Blocked</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                                                    title={user.isBlocked ? "Unblock User" : "Block User"}
                                                >
                                                    {user.isBlocked ? <CheckCircle2 size={20} /> : <Ban size={20} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={20} />
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

export default ManageUsers;
