import React from 'react';
import { Bell, FileText, Calendar, AlertCircle } from 'lucide-react';

const PortalDashboard = () => {
    const financialStatus = 'OK'; // 'PENDING';

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Painel do Associado</h1>
                <p className="text-slate-500 text-sm">Bem-vindo ao seu espaço exclusivo.</p>
            </header>

            {/* Financial Status Card */}
            <div className={`p-6 rounded-2xl border ${financialStatus === 'OK' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${financialStatus === 'OK' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold mb-1 ${financialStatus === 'OK' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                            {financialStatus === 'OK' ? 'Situação Regular' : 'Pendências Financeiras'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {financialStatus === 'OK'
                                ? 'Sua anuidade está em dia. Você tem acesso total a todos os benefícios.'
                                : 'Detectamos pendências. Regularize para evitar suspensão de benefícios.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Notices */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    Avisos Recentes
                </h2>
                <div className="space-y-3">
                    {[1, 2].map((item) => (
                        <div key={item} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-4">
                            <div className="w-1 bg-blue-500 rounded-full h-full min-h-[40px]"></div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1 font-mono">15 JAN</p>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Assembleia Geral Extraordinária</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Convocamos todos os sócios para votação da nova diretoria. Sua participação é fundamental.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Acesso Rápido</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Calendar className="w-6 h-6 text-purple-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Eventos</span>
                    </button>
                    <button className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ouvidoria</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
