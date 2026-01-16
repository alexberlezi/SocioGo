import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTenant } from '../../context/TenantContext';
import { Sun, Moon, Bell, Search, ChevronRight, ChevronDown, LogOut, User as UserIcon, Lock, X, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const Topbar = () => {
    const { theme, toggleTheme } = useTheme();
    const {
        activeTenantId,
        activeTenant,
        tenants,
        setActiveTenantId,
        isGlobalAdmin,
        isGlobalView
    } = useTenant();

    const [user, setUser] = useState(null);
    const [association, setAssociation] = useState(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [selectorOpen, setSelectorOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                if (parsed.associationId) fetchAssociationName(parsed.associationId);
            }
        };

        loadUser();

        const handleUserUpdate = () => loadUser();
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, []);

    const fetchAssociationName = async (id) => {
        try {
            const res = await fetch('http://localhost:3000/api/companies');
            if (res.ok) {
                const companies = await res.json();
                const found = companies.find(c => c.id === id);
                if (found) setAssociation(found);
            }
        } catch (e) {
            console.warn('Failed to fetch association for header');
        }
    };

    // Role Mapping
    const getRoleDisplay = () => {
        if (!user) return 'Usuário';
        switch (user.role) {
            case 'GLOBAL_ADMIN':
                return 'Admin Global';
            case 'ASSOCIATION_ADMIN':
                return association ? `Administrador ${association.name}` : 'Administrador';
            case 'FINANCIAL_OP':
                return 'Operador Financeiro';
            case 'COMMUNICATION_OP':
                return 'Operador Comunicação';
            default:
                return user.role || 'Usuário';
        }
    };

    // Get Initials from Name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Primary Color - from active tenant or user's association
    const primaryColor = activeTenant?.primaryColor || association?.primaryColor || '#2563eb';

    // Header accent based on selected tenant
    const headerAccentStyle = activeTenant ? {
        borderBottom: `3px solid ${activeTenant.primaryColor || '#2563eb'}`
    } : {};

    const handleTenantSelect = (tenantId) => {
        setActiveTenantId(tenantId);
        setSelectorOpen(false);
    };

    return (
        <header
            className="fixed top-0 left-0 lg:left-[280px] right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-40 transition-all duration-300 px-8 flex items-center justify-between"
            style={headerAccentStyle}
        >
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">Admin</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold text-gray-900 dark:text-white">Dashboard</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">

                {/* Tenant Switcher - Only for Global Admin */}
                {isGlobalAdmin && (
                    <div className="relative">
                        <button
                            onClick={() => setSelectorOpen(!selectorOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white text-sm font-medium transition-all border border-gray-200 dark:border-slate-700"
                            style={activeTenant ? { borderColor: activeTenant.primaryColor } : {}}
                        >
                            <Building2 className="w-4 h-4" style={{ color: activeTenant?.primaryColor || '#6b7280' }} />
                            <span className="max-w-[150px] truncate">
                                {isGlobalView ? 'Todas as Unidades' : activeTenant?.name || 'Selecionar'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {selectorOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setSelectorOpen(false)}
                                />

                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                                        <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase px-2">Selecionar Unidade</span>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {/* Global View Option */}
                                        <button
                                            onClick={() => handleTenantSelect(null)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${isGlobalView ? 'bg-gray-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Todas as Unidades</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-400">Visão consolidada</p>
                                            </div>
                                        </button>

                                        {/* Tenant List */}
                                        {tenants.map(tenant => (
                                            <button
                                                key={tenant.id}
                                                onClick={() => handleTenantSelect(tenant.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${activeTenantId === tenant.id ? 'bg-gray-50 dark:bg-slate-800' : ''}`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                                    style={{ backgroundColor: tenant.primaryColor || '#3b82f6' }}
                                                >
                                                    {tenant.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className={`font-medium text-sm ${activeTenantId === tenant.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'}`}>
                                                        {tenant.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-400">{tenant.status || 'Ativo'}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                    title={theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700"></div>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 cursor-pointer focus:outline-none"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                {user?.profile?.fullName || user?.name || 'Usuário'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {getRoleDisplay()}
                            </p>
                        </div>
                        {/* Avatar: Photo or Initials */}
                        <div
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {user?.profile?.photo || user?.photo ? (
                                <img src={user?.profile?.photo || user?.photo} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user?.profile?.fullName || user?.name)
                            )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setUserMenuOpen(false)}
                            ></div>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                    <Link
                                        to="/admin/profile"
                                        state={{ activeTab: 'general' }}
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
                                    >
                                        <UserIcon className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                                        Perfil
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            // Navigation with state to switch tab and focus
                                            navigate('/admin/profile', {
                                                state: {
                                                    activeTab: 'security',
                                                    focus: 'newPassword'
                                                }
                                            });
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group text-left"
                                    >
                                        <Lock className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                                        Redefinir Senha
                                    </button>

                                    <div className="h-px bg-slate-800 my-1"></div>

                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('user');
                                            localStorage.removeItem('token');
                                            navigate('/login');
                                            toast.success('Logout realizado com sucesso');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors group text-left"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
