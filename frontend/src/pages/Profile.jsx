import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    User, Shield, Settings, Camera, Save, Lock,
    Smartphone, Moon, Sun, CheckCircle, AlertTriangle, Key, Activity, LogOut
} from 'lucide-react';

const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('general');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [generalForm, setGeneralForm] = useState({ name: '', email: '', photo: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // MFA States
    const [mfaData, setMfaData] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [showMfaSetup, setShowMfaSetup] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setGeneralForm({
                name: parsed.profile?.fullName || parsed.name || '',
                email: parsed.email || '',
                photo: parsed.profile?.photo || ''
            });
        }
    }, []);

    // Check for navigation state from Header
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    // Handle focus on password field if requested
    useEffect(() => {
        if (activeTab === 'security' && location.state?.focus === 'newPassword') {
            // Small timeout to allow render
            setTimeout(() => {
                document.getElementById('newPasswordInput')?.focus();
            }, 100);
        }
    }, [activeTab, location.state]);

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/api/users/profile', {
                id: user.id,
                name: generalForm.name,
                email: generalForm.email,
                photo: generalForm.photo
            });

            if (res.ok) {
                const updated = await res.json();
                const newUser = { ...user, ...updated, profile: updated.profile || user.profile };
                if (updated.profile) newUser.profile = updated.profile;

                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                window.dispatchEvent(new Event('userUpdated'));
                toast.success('Perfil atualizado com sucesso!');
            } else {
                toast.error('Erro ao atualizar perfil');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('As senhas não coincidem');
        }

        setLoading(true);
        try {
            const res = await api.put('/api/users/password', {
                id: user.id,
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            if (res.ok) {
                toast.success('Senha alterada com sucesso!');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao alterar senha');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const startMfaSetup = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/users/mfa/generate', { id: user.id });
            if (res.ok) {
                const data = await res.json();
                setMfaData(data);
                setShowMfaSetup(true);
            } else {
                toast.error('Erro ao gerar MFA');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const confirmMfa = async (enable) => {
        if (enable && !mfaCode) return toast.error('Digite o código do app');

        setLoading(true);
        try {
            const res = await api.post('/api/users/mfa/toggle', {
                id: user.id,
                enable,
                token: mfaCode
            });

            if (res.ok) {
                const data = await res.json();
                const newUser = { ...user, mfaEnabled: data.mfaEnabled };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                window.dispatchEvent(new Event('userUpdated'));

                toast.success(data.message);
                setShowMfaSetup(false);
                setMfaCode('');
                setMfaData(null);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao verificar código');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <AdminLayout>
            <div className="max-w-[1600px] mx-auto p-6 space-y-8">

                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações de Perfil</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e proteja sua conta.</p>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: User Summary (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center text-center">
                            <div className="relative group w-32 h-32 mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-slate-800 shadow-xl">
                                    {generalForm.photo ? (
                                        <img src={generalForm.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <User className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        const url = prompt('Cole a URL da sua foto:');
                                        if (url) setGeneralForm(prev => ({ ...prev, photo: url }));
                                    }}
                                    className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.profile?.fullName || user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
                            <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                                {user.role === 'GLOBAL_ADMIN' ? 'Administrador Global' : user.role}
                            </div>
                        </div>

                        {/* Navigation Menu (Vertical for desktop) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <nav className="flex flex-col p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <User className="w-4 h-4" /> Dados Pessoais
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Shield className="w-4 h-4" /> Segurança e Login
                                </button>
                                <button
                                    onClick={() => setActiveTab('preferences')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'preferences'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Settings className="w-4 h-4" /> Preferências do Sistema
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* CENTER COLUMN: Main Content (6 cols) */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-8 min-h-[500px]">

                            {/* GENERAL TAB */}
                            {activeTab === 'general' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informações Pessoais</h3>
                                        <button
                                            onClick={handleGeneralSubmit}
                                            disabled={loading}
                                            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-lg shadow-gray-200 dark:shadow-none hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar</>}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nome Completo</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={generalForm.name}
                                                    onChange={e => setGeneralForm({ ...generalForm, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">E-mail</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={generalForm.email}
                                                    onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                                <div className="absolute left-3 top-3.5 flex items-center justify-center w-4 h-4">
                                                    <span className="text-gray-400 font-bold text-sm">@</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Informações de Contato</h4>
                                        <div className="grid grid-cols-2 gap-6 opacity-50 cursor-not-allowed">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Telefone</label>
                                                <input disabled type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="(00) 00000-0000" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Cargo</label>
                                                <input disabled type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="Administrador" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECURITY TAB */}
                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Segurança e Login</h3>
                                        {user.mfaEnabled ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Conta Protegida
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Requer Atenção
                                            </span>
                                        )}
                                    </div>

                                    {/* Change Password */}
                                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Key className="w-4 h-4 text-blue-500" /> Alterar Senha
                                        </h4>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="password"
                                                    placeholder="Senha Atual"
                                                    value={passwordForm.currentPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-all font-sans"
                                                />
                                                <div className="hidden md:block"></div> {/* Spacer */}

                                                <input
                                                    id="newPasswordInput"
                                                    type="password"
                                                    placeholder="Nova Senha"
                                                    value={passwordForm.newPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-all font-sans"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirmar Nova Senha"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-all font-sans"
                                                />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    Atualizar Senha
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* PREFERENCES TAB */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preferências do Sistema</h3>

                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            onClick={() => theme !== 'light' && toggleTheme()}
                                            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${theme === 'light'
                                                ? 'border-blue-600 bg-blue-50/50'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                                <Sun className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">Modo Claro</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aparência padrão, ideal para ambientes iluminados.</p>
                                            {theme === 'light' && <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-blue-600" />}
                                        </button>

                                        <button
                                            onClick={() => theme !== 'dark' && toggleTheme()}
                                            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${theme === 'dark'
                                                ? 'border-blue-600 bg-slate-800'
                                                : 'border-gray-200 dark:border-slate-800 hover:border-gray-400'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-700 shadow-sm flex items-center justify-center mb-4">
                                                <Moon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">Modo Escuro</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Menor brilho, confortável para uso noturno.</p>
                                            {theme === 'dark' && <CheckCircle className="absolute top-4 right-4 w-6 h-6 text-blue-600" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Security & Actions (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Security Card */}
                        <div className={`rounded-2xl border p-6 shadow-sm ${user.mfaEnabled
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                            : 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${user.mfaEnabled ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'}`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h3 className={`font-bold ${user.mfaEnabled ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>Status da Conta</h3>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {user.mfaEnabled
                                    ? 'Sua conta está protegida com autenticação de dois fatores (MFA).'
                                    : 'Sua conta está vulnerável a acessos não autorizados. Ative o MFA.'}
                            </p>

                            <button
                                onClick={() => {
                                    setActiveTab('security');
                                    if (!user.mfaEnabled) startMfaSetup();
                                }}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${user.mfaEnabled
                                    ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-500/20'
                                    }`}
                            >
                                {user.mfaEnabled ? 'Gerenciar Segurança' : 'Ativar Proteção Agora'}
                            </button>

                            {/* MFA Setup Mockup/Area for Modal/Expansion */}
                            {showMfaSetup && mfaData && (
                                <div className="mt-6 pt-6 border-t border-orange-200 dark:border-orange-800">
                                    <p className="text-xs font-bold text-orange-800 dark:text-orange-200 mb-2 text-center">ESCANEIE O QR CODE</p>
                                    <div className="bg-white p-2 rounded-lg w-fit mx-auto shadow-inner">
                                        <img src={mfaData.qrCodeUrl} alt="MFA QR Code" className="w-32 h-32" />
                                    </div>
                                    <input
                                        type="text"
                                        value={mfaCode}
                                        onChange={e => setMfaCode(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="w-full mt-4 text-center px-4 py-2 border border-orange-300 rounded-lg text-lg tracking-widest font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                    <button
                                        onClick={() => confirmMfa(true)}
                                        className="w-full mt-2 py-2 bg-orange-700 text-white rounded-lg font-bold text-xs uppercase"
                                    >
                                        Confirmar Código
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity (Visual Only) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" /> Atividade Recente
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Login realizado</p>
                                        <p className="text-xs text-gray-400">Hoje, 14:30 • IP 192.168.1.1</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Senha alterada</p>
                                        <p className="text-xs text-gray-400">Ontem, 09:15</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default Profile;
