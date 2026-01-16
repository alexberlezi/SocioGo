import React, { useState, useEffect } from 'react';
import { Server, Save, CheckCircle, Shield, AlertTriangle, Building2 } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { useFeatures } from '../components/auth/FeatureGuard';
import { FEATURE_GROUPS } from '../config/features.config';
import { toast } from 'react-hot-toast';

const SaasManagement = () => {
    const [features, setFeatures] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [companyName, setCompanyName] = useState('Global');

    // Read Company ID from URL
    const queryParams = new URLSearchParams(window.location.search);
    const companyId = queryParams.get('companyId');

    const user = JSON.parse(localStorage.getItem('user'));

    // SECURITY: Check if user is Global Admin
    const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN' || user?.id === '875b818e-aa0d-40af-885a-f00202bbd03c';

    // SECURITY: Block non-global admins from accessing global SaaS settings
    // They should only land here via /admin/saas?companyId=X where X is their own association
    if (!isGlobalAdmin && !companyId) {
        return (
            <AdminLayout>
                <div className="flex h-[70vh] items-center justify-center text-white flex-col gap-4">
                    <Shield className="w-16 h-16 text-red-500/50" />
                    <h1 className="text-3xl font-black">Acesso Negado</h1>
                    <p className="text-slate-400 max-w-md text-center">Você não tem permissão para acessar as configurações globais de SaaS. Contate o administrador global.</p>
                    <button onClick={() => window.history.back()} className="mt-4 px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">Voltar</button>
                </div>
            </AdminLayout>
        );
    }

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Features (Global or Tenant)
            const url = companyId
                ? `http://localhost:3000/api/saas/features?companyId=${companyId}`
                : 'http://localhost:3000/api/saas/features';

            const resFeatures = await fetch(url);
            if (resFeatures.ok) {
                const data = await resFeatures.json();
                setFeatures(data);
            }

            // 2. If Tenant, Fetch Company Name for Header
            if (companyId) {
                // Try fetching from companies list if individual endpoint not ready or just reuse find
                // Assuming companies endpoint exposes list or detailed view. 
                // Let's use the list for now or assume we passed name? No, safe to fetch list and find.
                // Or better, fetch company details route if available. 
                // We don't have GET /companies/:id officially exposed as detailed in routes snippet before (only POST/PUT/DELETE return/act on it).
                // Actually, the PUT route returns it. 
                // Let's just fetch all and find, or generic.
                const resCompanies = await fetch('http://localhost:3000/api/companies');
                if (resCompanies.ok) {
                    const companies = await resCompanies.json();
                    const current = companies.find(c => c.id === parseInt(companyId));
                    if (current) setCompanyName(current.name);
                }
            } else {
                setCompanyName('Global (Landing Page)');
            }

        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setFeatures(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = { userId: user.id, features };
            if (companyId) body.companyId = companyId;

            const res = await fetch('http://localhost:3000/api/saas/features', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success('Funcionalidades atualizadas com sucesso!');
                // Don't reload, just confirmation is enough
            } else {
                toast.error('Erro ao salvar. Verifique permissões.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center text-white">Carregando...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <Server className="w-8 h-8 text-blue-600" />
                            Gestão de Módulos (SaaS)
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 flex items-center gap-2">
                            Contexto: <strong className="text-blue-600 flex items-center gap-1"><Building2 className="w-3 h-3" /> {companyName}</strong>
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : <><Save className="w-5 h-5" /> Salvar Alterações</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {Object.entries(FEATURE_GROUPS).map(([groupName, groupFeatures]) => (
                        <div key={groupName} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col h-full">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-slate-800 pb-2">
                                {groupName}
                            </h3>

                            <div className="space-y-8 flex-1">
                                {groupFeatures.map((feat) => (
                                    <div key={feat.key} className="flex items-start justify-between gap-4 group">
                                        <div className="flex flex-col gap-1.5 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-base ${features[feat.key] ? 'text-slate-900 dark:text-white' : 'text-gray-500'} transition-colors`}>
                                                    {feat.label}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${features[feat.key] ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
                                                    {features[feat.key] ? 'ATIVO' : 'Inativo'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">
                                                {feat.description}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleToggle(feat.key)}
                                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative shrink-0 ${features[feat.key] ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${features[feat.key] ? 'translate-x-6' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4 mx-auto max-w-3xl w-full">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-yellow-500 font-bold text-base mb-1">Atenção Admin</h4>
                        <p className="text-yellow-500/80 text-sm leading-relaxed">
                            {companyId
                                ? `Alterações aqui afetam APENAS a associação ${companyName}. Desativar módulos remove acesso imediato dos usuários desta unidade.`
                                : "Alterações aqui afetam as configurações GERAIS (Padrão para novos tenants)."}
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SaasManagement;
