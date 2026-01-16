import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AssociationSettings = () => {
    const [settings, setSettings] = useState({
        suspensionGracePeriod: 3 // Default value
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Here we would typically save to backend
        // For now, we simulate a save
        console.log('Saving settings:', settings);

        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Salvando configurações...',
                success: 'Configurações atualizadas com sucesso!',
                error: 'Erro ao salvar.'
            }
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações da Associação</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Gerencie parâmetros globais e regras de negócio do sistema.
                    </p>
                </div>

                {/* Settings Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            Regras de Inadimplência
                        </h2>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="suspensionGracePeriod" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Carência para Suspensão Automática (meses)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="suspensionGracePeriod"
                                        name="suspensionGracePeriod"
                                        min="1"
                                        value={settings.suspensionGracePeriod}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                                    />
                                    <div className="absolute right-4 top-2.5 text-xs font-bold text-gray-400 pointer-events-none">
                                        MESES
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Define após quantos meses de inadimplência o sistema deve suspender o acesso do sócio automaticamente.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Save className="w-4 h-4" />
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AssociationSettings;
