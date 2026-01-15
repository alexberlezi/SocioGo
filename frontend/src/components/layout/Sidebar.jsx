import React from 'react';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    DollarSign,
    Calendar,
    Settings,
    LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to, badge, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400'}`} />
        <span className="font-medium text-sm">{label}</span>
        {badge && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {badge}
            </span>
        )}
    </Link>
);

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transition-colors duration-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">SocioGo</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>

                <NavItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    to="/admin"
                    active={isActive('/admin')}
                />
                <NavItem
                    icon={UserCheck}
                    label="Aprovação de Sócios"
                    to="/admin/approvals"
                    badge="3"
                    active={isActive('/admin/approvals')}
                />
                <NavItem
                    icon={Users}
                    label="Gestão de Sócios"
                    to="/admin/members"
                />

                <div className="px-4 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestão</div>

                <NavItem
                    icon={DollarSign}
                    label="Financeiro"
                    to="/admin/finance"
                />
                <NavItem
                    icon={Calendar}
                    label="Eventos"
                    to="/admin/events"
                />
                <NavItem
                    icon={Settings}
                    label="Configurações"
                    to="/admin/settings"
                />
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
