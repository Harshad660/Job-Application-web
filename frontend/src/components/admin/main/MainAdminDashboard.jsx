import React, { useEffect, useState } from 'react';
import Navbar from '../../shared/Navbar';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';
import { Users, Briefcase, FileText, Building2, TrendingUp } from 'lucide-react';

const MainAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/admin/stats', { withCredentials: true });
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-screen text-2xl">Loading Stats...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const summaryCards = [
        { title: 'Total Students', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
        { title: 'Total Recruiters', value: stats?.totalRecruiters || 0, icon: Building2, color: 'bg-green-500' },
        { title: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'bg-yellow-500' },
        { title: 'Total Applications', value: stats?.totalApplications || 0, icon: FileText, color: 'bg-purple-500' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="text-red-600 w-8 h-8" />
                        <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {summaryCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${card.color} text-white`}>
                                            <Icon size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Jobs Trend Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Recent Job Activity</h2>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.jobStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="_id" />
                                        <YAxis />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Application Status Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Application Status Distribution</h2>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.applicationStats}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {stats?.applicationStats?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {stats?.applicationStats?.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-sm text-gray-600 capitalize">{entry._id}: {entry.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainAdminDashboard;
