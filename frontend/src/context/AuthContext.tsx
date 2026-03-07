import React, { createContext, useContext, useState } from 'react';

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
    const [authState, setAuthState] = useState<AuthState>({
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role') as 'ADMIN' | 'AGENCY' | null,
        isAuthenticated: !!localStorage.getItem('token'),
    });

    const login = (token: string, username: string, role: string) => {
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
