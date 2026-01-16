import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, CreditCard, Vote, User, LogOut, FileText } from 'lucide-react';

const MemberPortalLayout = () => {
    const navigate = useNavigate();

    // Mock User Data (Replace with Context/Auth)
    const user = {
        name: "Alex Silva",
        avatar: "https://i.pravatar.cc/150?u=alex",
        role: "Sócio Pleno"
    };

    const navItems = [
        { icon: Home, label: 'Início', path: '/portal/dashboard' },
        { icon: CreditCard, label: 'Carteira', path: '/portal/carteirinha' }, // Dynamic ID needs handling in real app
        { icon: Vote, label: 'Votações', path: '/portal/votacoes' },
        { icon: FileText, label: 'Certificados', path: '/portal/certificados' },
        { icon: User, label: 'Perfil', path: '/portal/perfil' },
    ];

    const handleLogout = () => {
        // Clear auth logic here
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20 md:pb-0 md:flex">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        SocioGo
                    </h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wider mt-1">PORTAL DO SÓCIO</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                                ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700" />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white">Olá, {user.name.split(' ')[0]}</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Sócio</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 py-2 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px]
                            ${isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'}
                        `}
                    >
                        <div className={`
                             p-1.5 rounded-full transition-all
                             ${location.pathname === item.path ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent'}
                        `}>
                            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MemberPortalLayout;
