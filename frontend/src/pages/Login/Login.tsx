import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api';
import { Plane, Lock, User, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import ui from '../../styles/ui.module.css';
import styles from './Login.module.css';

export const Login: React.FC = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/routes';

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isRegistering) {
                await fetchApi('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ username, password }),
                });
                // Auto-login after register
            }

            const response = await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            login(response.token, response.username, response.role);
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoWrap}>
                        <div className={styles.logoBadge}>
                            <Plane size={32} />
                        </div>
                    </div>
                    <h2 className={styles.title}>
                        {isRegistering ? 'Create your account' : 'Sign in to your account'}
                    </h2>
                    <p className={styles.subtitle}>
                        THY Route Planner Portal
                    </p>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <div className={styles.errorRow}>
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldStack}>
                        <div>
                            <label className={ui.formLabel}>Username</label>
                            <div className={styles.fieldWrap}>
                                <div className={styles.iconWrap}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className={cn(ui.field, ui.fieldWithIcon)}
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={ui.formLabel}>Password</label>
                            <div className={styles.fieldWrap}>
                                <div className={styles.iconWrap}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className={cn(ui.field, ui.fieldWithIcon)}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(ui.primaryButton, ui.primaryButtonWide)}
                        >
                            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                        </button>
                    </div>
                </form>

                <div className={styles.switchRow}>
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className={styles.switchButton}
                    >
                        {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                    </button>
                </div>
            </div>
        </div>
    );
};
