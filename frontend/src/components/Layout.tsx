import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, MapPin, Bus, LogOut, Menu, X, ArrowRightLeft } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { role, logout, username } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/routes', icon: <ArrowRightLeft size={20} />, label: 'Find Routes', show: true },
        { to: '/locations', icon: <MapPin size={20} />, label: 'Locations', show: role === 'ADMIN' },
        { to: '/transportations', icon: <Bus size={20} />, label: 'Transportations', show: role === 'ADMIN' },
    ];

    return (
        <>
            <div className="md:hidden p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Plane className="text-red-500" /> THY Route Planner
                </div>
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen
      `}>
                <div className="p-6 flex items-center gap-3 font-bold text-2xl text-white border-b border-slate-800">
                    <Plane className="text-red-500" size={28} />
                    <span>Route Planner</span>
                </div>

                <div className="p-4 text-sm text-slate-500 font-medium">
                    Welcome, <span className="text-slate-300 font-bold">{username}</span> ({role})
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => item.show && (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${isActive ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
              `}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors font-medium text-red-400 hover:bg-slate-800 hover:text-red-300"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
