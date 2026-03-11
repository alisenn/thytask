import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_EXPIRED_EVENT } from '../services/api';

const VALID_ROLES = ['ADMIN', 'AGENCY'] as const;
const isValidRole = (value: string | null): value is (typeof VALID_ROLES)[number] => value === 'ADMIN' || value === 'AGENCY';

const parseStoredAuth = (): AuthState => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const role = isValidRole(storedRole) ? storedRole : null;

    if (!token || !username || !role) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        return { token: null, username: null, role: null, isAuthenticated: false };
    }

    try {
        const payload = JSON.parse(window.atob(token.split('.')[1] || '')) as { exp?: number };
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            return { token: null, username: null, role: null, isAuthenticated: false };
        }
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        return { token: null, username: null, role: null, isAuthenticated: false };
    }

    return { token, username, role, isAuthenticated: true };
};

interface AuthState {
    token: string | null;
    username: string | null;
    role: 'ADMIN' | 'AGENCY' | null;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (token: string, username: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(parseStoredAuth);

    const login = (token: string, username: string, role: string) => {
        if (!isValidRole(role)) {
            logout();
            return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        setAuthState({
            token,
            username,
            role: role as 'ADMIN' | 'AGENCY',
            isAuthenticated: true,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setAuthState({
            token: null,
            username: null,
            role: null,
            isAuthenticated: false,
        });
    };

    useEffect(() => {
        const handleAuthExpired = () => {
            logout();
        };

        window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

        return () => {
            window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
