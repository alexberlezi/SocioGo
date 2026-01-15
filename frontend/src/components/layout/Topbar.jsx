import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Search, ChevronRight } from 'lucide-react';

const Topbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 left-0 lg:left-[280px] right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 z-40 transition-colors duration-300 px-8 flex items-center justify-between">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">Admin</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-semibold text-gray-900 dark:text-white">Aprovação de Sócios</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
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
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Admin User</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Administrador</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-2 border-white dark:border-slate-700 shadow-sm"></div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
