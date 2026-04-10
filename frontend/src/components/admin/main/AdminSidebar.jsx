import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    FileText, 
    Building2,
    ShieldCheck
} from 'lucide-react';

const AdminSidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Manage Users', icon: Users, path: '/admin/main/users' },
        { name: 'Manage Recruiters', icon: Building2, path: '/admin/main/recruiters' },
        { name: 'Manage Jobs', icon: Briefcase, path: '/admin/main/jobs' },
        { name: 'Manage Applications', icon: FileText, path: '/admin/main/applications' },
    ];

    return (
        <div className="w-64 bg-white shadow-xl h-screen sticky top-0 left-0 p-4 border-r hidden md:block">
            <div className="flex items-center gap-2 mb-8 px-2">
                <ShieldCheck className="text-red-600 h-8 w-8" />
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                ? 'bg-red-50 text-red-600 font-semibold' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminSidebar;
