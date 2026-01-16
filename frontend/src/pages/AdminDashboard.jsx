import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { BarChart3, Users, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
    // Placeholder content for the Dashboard overview
    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Geral</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Visão geral dos indicadores da associação.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total de Sócios', value: '1,234', icon: Users, color: 'blue' },
                    { title: 'Novos este mês', value: '+42', icon: TrendingUp, color: 'green' },
                    { title: 'Receita Mensal', value: 'R$ 45.2k', icon: DollarSign, color: 'emerald' },
                    { title: 'Taxa de Retenção', value: '98%', icon: BarChart3, color: 'purple' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-900/20 dark:text-${stat.color}-400`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-gray-100 dark:border-slate-800 border-dashed">
                <p className="text-gray-400 font-medium">Gráficos e métricas detalhadas virão aqui.</p>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
