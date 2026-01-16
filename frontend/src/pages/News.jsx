import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Newspaper } from 'lucide-react';

const News = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 border-dashed">
                <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
                    <Newspaper className="w-10 h-10 text-purple-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Notícias e Comunicados</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    O módulo de notícias está em desenvolvimento. Em breve você poderá publicar informativos para o portal do sócio e app móvel.
                </p>
                <span className="mt-8 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    Em Breve
                </span>
            </div>
        </AdminLayout>
    );
};

export default News;
