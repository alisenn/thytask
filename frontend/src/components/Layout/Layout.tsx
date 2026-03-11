import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plane, MapPin, Bus, LogOut, Menu, X, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import styles from './Layout.module.css';

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
            <div className={styles.mobileBar}>
                <div className={styles.brand}>
                    <Plane className={styles.brandIcon} /> THY Route Planner
                </div>
                <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            <aside className={cn(styles.sidebar, isOpen && styles.sidebarOpen)}>
                <div className={styles.sidebarHeader}>
                    <Plane className={styles.brandIcon} size={28} />
                    <span>Route Planner</span>
                </div>

                <div className={styles.welcome}>
                    Welcome, <span className={styles.welcomeStrong}>{username}</span> ({role})
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => item.show && (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
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
        <div className={styles.appShell}>
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
