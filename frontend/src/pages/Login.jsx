import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();

    // Step 1: Identification, Step 2: Authentication
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');

    // Tenant / Branding State
    const [branding, setBranding] = useState({
        name: 'SocioGo',
        logoLight: null,
        logoDark: null,
        primaryColor: '#2563eb' // Default Blue
    });

    // Auth State
    const [mfaRequired, setMfaRequired] = useState(false);
    const [error, setError] = useState(null);

    // Step 1: Identify Tenant on Email Blur or Continue
    const handleIdentify = async () => {
        if (!email) return;
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/api/auth/identify?email=${email}`);

            if (!response.ok) {
                // Network or Server Error?
                if (response.status === 500) throw new Error('Erro interno no servidor.');
                if (response.status === 403) {
                    const data = await response.json();
                    throw new Error(data.error || 'Acesso negado.');
                }
            }

            const data = await response.json();

            if (data.exists) {
                // Apply Tenant Branding
                if (data.branding) {
                    setBranding(data.branding);
                    // Dynamically set CSS variable for primary color if needed, or just inline
                }
                setStep(2);
            } else {
                // User doesn't exist, but maybe we don't want to reveal this?
                // For this app, we might just show invalid credentials later.
                // But to fulfill "Identify", let's assume we let them proceed to password to fail there.
                setStep(2);
            }
        } catch (err) {
            console.error(err);
            // "Connection Refused" handling
            if (err.message.includes('Failed to fetch')) {
                setError('O servidor está indisponível. Tente novamente em instantes.');
            } else {
                setError(err.message || 'Erro ao identificar usuário.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Authenticate
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, mfaCode })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error) throw new Error(data.error);
                throw new Error('Falha na autenticação.');
            }

            // MFA Challenge
            if (data.mfaRequired) {
                setMfaRequired(true);
                setLoading(false);
                return;
            }

            // Success
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Should be safe user object

            toast.success(`Bem-vindo, ${data.user.name}!`);

            // Redirect based on Role?
            // Global Admin usually goes to /admin/associations or /admin
            navigate('/admin');

        } catch (err) {
            console.error(err);
            if (err.message.includes('Failed to fetch')) {
                setError('O servidor está indisponível. Verifique sua conexão.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden transition-colors duration-700">
            {/* Background Ambience based on Primary Color */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-700"
                style={{ background: `radial-gradient(circle at 50% 50%, ${branding.primaryColor}, transparent 70%)` }}
            />

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">

                {/* Branding Header */}
                <div className="text-center mb-8 h-20 flex items-center justify-center transition-all duration-500">
                    {/* Show Logo if available, else Name */}
                    {branding.logoDark || branding.logoLight ? (
                        <img
                            src={branding.logoDark || branding.logoLight}
                            alt={branding.name}
                            className="h-16 object-contain"
                        />
                    ) : (
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {branding.name}
                        </h1>
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Step 1: Email */}
                    <div className={step === 1 ? 'block' : 'hidden'}>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': branding.primaryColor }}
                            placeholder="seu@email.com"
                        />
                        <button
                            type="button"
                            onClick={handleIdentify}
                            disabled={loading || !email}
                            className="w-full mt-5 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </div>

                    {/* Step 2: Password & MFA */}
                    {step === 2 && (
                        <div className="animate-fadeIn">
                            {/* User Identity Preview */}
                            <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slae-300">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{email}</p>
                                    <button onClick={() => setStep(1)} type="button" className="text-xs text-slate-400 hover:text-white transition-colors">Trocar conta</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        style={{ '--tw-ring-color': branding.primaryColor }}
                                        placeholder="••••••••"
                                    />
                                </div>

                                {mfaRequired && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Código de Verificação
                                        </label>
                                        <input
                                            type="text"
                                            required={mfaRequired}
                                            value={mfaCode}
                                            onChange={(e) => setMfaCode(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                            style={{ '--tw-ring-color': branding.primaryColor }}
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: branding.primaryColor }}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mfaRequired ? 'Verificar' : 'Entrar')}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-slate-600 text-xs text-center w-full">
                Protected by SocioGo Auth &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Login;
