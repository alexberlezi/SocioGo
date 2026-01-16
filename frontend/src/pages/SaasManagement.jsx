import React, { useState, useEffect } from 'react';
import { Server, Save, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { useFeatures } from '../components/auth/FeatureGuard';
import { FEATURE_GROUPS } from '../config/features.config';
import { toast } from 'react-hot-toast';

const SaasManagement = () => {
    const [features, setFeatures] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/saas/features');
            if (res.ok) {
                const data = await res.json();
                setFeatures(data);
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
            const res = await fetch('http://localhost:3000/api/saas/features', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, features })
            });

            if (res.ok) {
                toast.success('Funcionalidades atualizadas com sucesso!');
                setTimeout(() => window.location.reload(), 1000);
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
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Controle de licenciamento e features ativas.
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
                            Desativar módulos críticos (como Site ou Portal) removerá **instantaneamente** o acesso para todos os usuários e ocultará os menus relacionados.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SaasManagement;
