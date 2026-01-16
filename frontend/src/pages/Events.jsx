import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Calendar } from 'lucide-react';

const Events = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 border-dashed">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                    <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Gestão de Eventos</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    O módulo de eventos está em desenvolvimento. Em breve você poderá criar, gerenciar inscrições e controlar a lista de presença por aqui.
                </p>
                <span className="mt-8 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    Em Breve
                </span>
            </div>
        </AdminLayout>
    );
};

export default Events;
