import React, { useState } from 'react';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    DollarSign,
    Wallet,
    Tags,
    Calendar,
    Settings,
    LogOut,
    History,
    FileText,
    Lock as LockIcon,
    ShieldAlert,
    Server,
    ChevronDown,
    ChevronRight,
    Newspaper,
    Vote,
    Megaphone,
    Shield,
    LayoutGrid, // Alternative icon for SaaS
    Building2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useFeatures } from '../../components/auth/FeatureGuard';

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

const CollapsibleNavItem = ({ icon: Icon, label, children, active }) => {
    const [isOpen, setIsOpen] = useState(active);

    React.useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    return (
        <div className="mb-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active && !isOpen
                    ? 'bg-blue-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
            >
                <Icon className={`w-5 h-5 ${active && !isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400'}`} />
                <span className="font-medium text-sm flex-1 text-left">{label}</span>
                {isOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>

            {isOpen && (
                <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-1 mt-1">
                    {children}
                </div>
            )}
        </div>
    );
};

const Sidebar = () => {
    const location = useLocation();
    const [pendingCount, setPendingCount] = React.useState(0);
    const { features } = useFeatures();

    // Get user for Role Check
    const user = JSON.parse(localStorage.getItem('user'));

    // Debug Role for migration
    console.log('[Sidebar] Current User Role:', user?.role, 'ID:', user?.id);

    // Explicit Role Check: Broaden to catch 'Admin', 'admin', 'Administrator' OR Specific User UUID
    // Matches GlobalAdminGuard logic
    const isGlobalAdmin = user?.role?.toLowerCase().includes('admin') ||
        String(user?.id) === '1' ||
        user?.id === '875b818e-aa0d-40af-885a-f00202bbd03c';

    console.log('[Sidebar] Debug - User:', user, 'isGlobalAdmin:', isGlobalAdmin);

    React.useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/admin/pending-members');
                if (response.ok) {
                    const data = await response.json();
                    setPendingCount(data.length);
                }
            } catch (error) {
                // Silently fail to avoid blocking UI, just log warning
                // Silently fail to avoid blocking UI or console red errors
                // console.warn('Sidebar: Failed to fetch pending count');
            }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

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
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>

                <NavItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    to="/admin"
                    active={location.pathname === '/admin'}
                />

                {/* Comunicação Collapsible */}
                <CollapsibleNavItem
                    icon={Megaphone}
                    label="Comunicação"
                    active={isActive('/admin/news') || isActive('/admin/polls')}
                >
                    <NavItem
                        icon={Newspaper}
                        label="Notícias"
                        to="/admin/news"
                        active={isActive('/admin/news')}
                    />
                    <NavItem
                        icon={Vote}
                        label="Pesquisas"
                        to="/admin/polls"
                        active={isActive('/admin/polls')}
                    />
                </CollapsibleNavItem>

                {/* Acessos Collapsible */}
                <CollapsibleNavItem
                    icon={Users}
                    label="Acessos"
                    active={isActive('/admin/approvals') || isActive('/admin/members') || isActive('/admin/profiles')}
                >
                    <NavItem
                        icon={UserCheck}
                        label="Aprovação"
                        to="/admin/approvals"
                        badge={pendingCount > 0 ? pendingCount.toString() : null}
                        active={isActive('/admin/approvals')}
                    />
                    <NavItem
                        icon={Users}
                        label="Sócios"
                        to="/admin/members"
                        active={isActive('/admin/members')}
                    />
                    <NavItem
                        icon={Shield}
                        label="Perfis"
                        to="/admin/profiles"
                        active={isActive('/admin/profiles')}
                    />
                </CollapsibleNavItem>


                <div className="px-4 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestão</div>

                {/* Financeiro Group (Alphabetical) */}
                {features.FINANCEIRO_ADM && (
                    <>
                        <NavItem
                            icon={LockIcon}
                            label="Fechamento"
                            to="/admin/financeiro/fechamento"
                            active={isActive('/admin/financeiro/fechamento')}
                        />

                        <NavItem
                            icon={DollarSign}
                            label="Financeiro"
                            to="/admin/financeiro"
                            active={isActive('/admin/financeiro') && !isActive('/admin/financeiro/')}
                        />

                        <NavItem
                            icon={Wallet}
                            label="Movimentações"
                            to="/admin/fluxo-caixa"
                            active={isActive('/admin/fluxo-caixa')}
                        />

                        <NavItem
                            icon={Tags}
                            label="Plano de Contas"
                            to="/admin/financeiro/categorias"
                            active={isActive('/admin/financeiro/categorias')}
                        />
                    </>
                )}

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

                {/* Governança - Available for all admins if enabled, or strictly global? 
                    User said 'Auditoria' -> 'Governança'. I'll put Audit here but group name? 
                    The user said "Move 'Auditoria' to Governance". 
                    BUT also "Este grupo inteiro [SISTEMA] só deve ser renderizado se Admin Global".
                    Where does Audit go if not Global Admin? 
                    Maybe Audit IS Global Admin only? User previous request: "Move 'Auditoria' to new group 'GOVERNANÇA'".
                    Let's assume Governance = Audit + SaaS.
                    Re-reading Step 3464: "Este item (Auditoria)... só deve ser renderizado se Global Admin".
                    So yes, Audit is restricted. 
                */}

                {isGlobalAdmin && (
                    <>
                        <div className="px-4 mt-8 mb-2 text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3" />
                            SISTEMA
                        </div>

                        <NavItem
                            icon={Users}
                            label="Usuários"
                            to="/admin/users"
                            active={isActive('/admin/users')}
                        />

                        {isGlobalAdmin && (
                            <NavItem
                                icon={Building2} // Need import
                                label="Associações"
                                to="/admin/associations"
                                active={isActive('/admin/associations')}
                            />
                        )}

                        {features.AUDITORIA && (
                            <NavItem
                                icon={ShieldAlert}
                                label="Auditoria"
                                to="/admin/financeiro/logs"
                                active={isActive('/admin/financeiro/logs')}
                            />
                        )}

                        <NavItem
                            icon={Server}
                            label="Gestão de SaaS"
                            to="/admin/saas"
                            badge="Novo"
                            active={isActive('/admin/saas')}
                        />
                    </>
                )}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sair do Sistema</span>
                </button>
                <div className="text-[10px] text-gray-300 mt-2 text-center font-mono">
                    DEBUG: {user?.role} [ID: {user?.id}]
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
