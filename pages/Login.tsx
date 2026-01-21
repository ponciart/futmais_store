import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu email para confirmar a conta (ou faça login se a confirmação estiver desligada).');
                setMode('signin');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 text-primary mb-4">
                        <span className="material-symbols-outlined text-4xl">sports_soccer</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Futmais Store</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {mode === 'signin' ? 'Bem-vindo de volta! Entre na sua conta.' : 'Crie sua conta para começar.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                        {mode === 'signin' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'signin' ? (
                        <>
                            Ainda não tem uma conta?{' '}
                            <button onClick={() => setMode('signup')} className="text-primary font-bold hover:underline">Cadastre-se</button>
                        </>
                    ) : (
                        <>
                            Já tem uma conta?{' '}
                            <button onClick={() => setMode('signin')} className="text-primary font-bold hover:underline">Faça login</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
