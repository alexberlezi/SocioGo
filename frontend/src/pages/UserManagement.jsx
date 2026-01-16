import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Shield, User, Lock, MoreHorizontal, CheckCircle, XCircle, Pencil, Ban, Trash2, ShieldAlert } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import CustomSelect from '../components/ui/CustomSelect';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [associations, setAssociations] = useState([]); // State for associations
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [associationFilter, setAssociationFilter] = useState('ALL');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '', // Should be auto-generated or set
        role: 'ASSOCIATION_ADMIN',
        associationId: '',
        mfaEnabled: false
    });

    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Check Permissions
    const isGlobalAdmin = currentUser?.role === 'GLOBAL_ADMIN' ||
        currentUser?.role === 'Admin Global' ||
        String(currentUser?.id) === '1' ||
        currentUser?.id === '875b818e-aa0d-40af-885a-f00202bbd03c';

    // Mock associations removed in favor of real data fetch

    const roles = [
        {
            id: 'GLOBAL_ADMIN',
            name: 'Global Admin',
            color: '#8b5cf6',
            description: 'Acesso total a todas as associações e configurações do sistema SaaS.'
        },
        {
            id: 'ASSOCIATION_ADMIN',
            name: 'Admin Associação',
            color: '#3b82f6',
            description: 'Gestão completa da própria associação (Sócios, Financeiro, Eventos).'
        },
        {
            id: 'FINANCIAL_OP',
            name: 'Operador Financeiro',
            color: '#94a3b8',
            description: 'Acesso restrito a lançamentos financeiros e fechamento de caixa.'
        },
        {
            id: 'COMMUNICATION_OP',
            name: 'Operador Comunicação',
            color: '#94a3b8',
            description: 'Gestão de notícias, enquetes e comunicados.'
        }
    ];

    useEffect(() => {
        fetchUsers();
        fetchAssociations();

        // Listen for tenant changes and auto-refresh
        const handleTenantChange = () => {
            setLoading(true);
            fetchUsers();
        };
        window.addEventListener('tenantChanged', handleTenantChange);
        return () => window.removeEventListener('tenantChanged', handleTenantChange);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            if (res.ok) {
                let data = await res.json();

                // SECURITY: Tenant Isolation for ASSOCIATION_ADMIN
                if (!isGlobalAdmin && currentUser?.associationId) {
                    data = data.filter(u =>
                        u.associationId === currentUser.associationId &&
                        u.role !== 'GLOBAL_ADMIN' // Never show GLOBAL_ADMIN to local admins
                    );
                }

                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssociations = async () => {
        try {
            const res = await api.get('/api/companies');
            if (res.ok) {
                const data = await res.json();
                console.log('Empresas carregadas:', data);
                setAssociations(data.map(a => ({ id: a.id, name: a.name }))); // Ensure correct shape for CustomSelect
            }
        } catch (error) {
            console.error('Failed to fetch associations:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            // Tenant Logic: Override if not global admin
            const finalData = {
                ...newUser,
                associationId: isGlobalAdmin ? newUser.associationId : (currentUser.associationId || 1),
                currentUserId: currentUser?.id
            };

            const isEdit = !!newUser.id;
            const url = isEdit ? `http://localhost:3000/api/users/${newUser.id}` : 'http://localhost:3000/api/users';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData)
            });

            if (res.ok) {
                toast.success(`Usuário ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
                setIsCreateModalOpen(false);
                fetchUsers();
                setNewUser({ name: '', email: '', password: '', role: 'ASSOCIATION_ADMIN', associationId: '', mfaEnabled: false });
            } else {
                const err = await res.json();
                toast.error(err.error || `Erro ao ${isEdit ? 'atualizar' : 'criar'} usuário`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        // Basic association filter logic (if we returned associationId populated)
        // Since we are just listing, we simulate filtering if data supports it
        // Or filter specifically if Global Admin used the dropdown

        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const r = roles.find(ro => ro.id === role) || { name: role, color: '#64748b' };
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: r.color }}>
                {r.name}
            </span>
        );
    };

    const [userToDelete, setUserToDelete] = useState(null);

    // ACTIONS
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
        try {
            const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    currentUserId: currentUser?.id
                })
            });
            if (res.ok) {
                toast.success(`Usuário ${newStatus === 'SUSPENDED' ? 'Suspenso' : 'Ativado'}!`);
                fetchUsers();
            } else {
                toast.error('Erro ao atualizar status');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        }
    };

    const handleEditUser = (user) => {
        setNewUser({
            id: user.id,
            name: user.profile?.fullName || '',
            email: user.email,
            password: '',
            role: user.role,
            associationId: user.associationId || '',
            mfaEnabled: user.mfaEnabled,
            status: user.status
        });
        setIsCreateModalOpen(true);
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${userToDelete.id}?currentUserId=${currentUser?.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Usuário excluído!');
                fetchUsers();
                setUserToDelete(null);
            } else {
                toast.error('Erro ao excluir');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        }
    };

    if (loading) return null; // Or loader

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full px-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <User className="w-8 h-8 text-blue-600" />
                            Gestão de Usuários
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Administração de contas, níveis de acesso e segurança (MFA).
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setNewUser({ name: '', email: '', password: '', role: 'ASSOCIATION_ADMIN', associationId: '', mfaEnabled: false, status: 'APPROVED' });
                            setIsCreateModalOpen(true);
                        }}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Usuário
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-slate-300"
                        />
                    </div>

                    <div className="w-full lg:w-64">
                        <CustomSelect
                            value={roleFilter}
                            onChange={setRoleFilter}
                            placeholder="Filtrar por Perfil"
                            icon={Shield}
                            options={[{ id: 'ALL', name: 'Todos os Perfis' }, ...roles]}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil (Acesso)</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Associação</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider center">MFA</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Último Acesso</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                                                    {u.profile?.fullName?.[0] || u.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {u.profile?.fullName || '---'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {/* Simulate Association Name lookup */}
                                            {associations.find(a => a.id === u.associationId)?.name || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${u.mfaEnabled
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                                {u.mfaEnabled ? <Shield className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                {u.mfaEnabled ? 'ATIVO' : 'OFF'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-500">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Nunca'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(u)}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(u)}
                                                    className={`p-2 rounded-lg transition-colors ${u.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                                                    title={u.status === 'SUSPENDED' ? 'Ativar' : 'Suspender'}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(u)}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-6 h-6 text-blue-600" />
                                {newUser.id ? 'Editar Usuário' : 'Novo Usuário'}
                            </h3>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Senha {newUser.id ? '(Deixe em branco p/ manter)' : 'Temporária'}</label>
                                    <input
                                        required={!newUser.id}
                                        type="text"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Perfil de Acesso</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {roles.map((roleOption) => (
                                            <div
                                                key={roleOption.id}
                                                onClick={() => setNewUser({ ...newUser, role: roleOption.id })}
                                                className={`cursor-pointer p-4 rounded-xl border transition-all relative ${newUser.role === roleOption.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{roleOption.name}</span>
                                                    {newUser.role === roleOption.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {roleOption.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div >

                            {/* Tenant Isolation Logic */}
                            {
                                isGlobalAdmin && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Associação (Multi-tenant)</label>
                                        <CustomSelect
                                            value={newUser.associationId}
                                            onChange={val => setNewUser({ ...newUser, associationId: val })}
                                            options={associations}
                                            placeholder="Selecione a Associação do Usuário"
                                        />
                                        {newUser.id && newUser.role === 'GLOBAL_ADMIN' && (
                                            <p className="text-xs text-orange-500 mt-2">
                                                ⚠️ Cuidado ao mover Admin Global de Associação.
                                            </p>
                                        )}
                                    </div>
                                )
                            }

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Exigir MFA no Login</h4>
                                    <p className="text-xs text-slate-500">Obrigatória configuração de 2FA no próximo acesso.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNewUser(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }))}
                                    className={`w-14 h-8 rounded-full p-1 transition-colors relative ${newUser.mfaEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${newUser.mfaEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div >

                        <div className="px-8 py-6 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="h-10 px-6 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20"
                            >
                                {newUser.id ? 'Atualizar Usuário' : 'Criar Usuário'}
                            </button>
                        </div>
                    </form >
                </div >
            )}

            {/* Delete Confirmation Modal */}
            {
                userToDelete && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-red-100 dark:border-red-900 overflow-hidden transform transition-all scale-100">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldAlert className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Excluir Usuário?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Tem certeza que deseja remover <strong>{userToDelete.profile?.fullName || userToDelete.email}</strong>?
                                    <br />
                                    <span className="text-red-500 font-bold text-xs mt-2 block">
                                        ⚠️ Esta ação é irreversível e será registrada na auditoria.
                                    </span>
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setUserToDelete(null)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all"
                                    >
                                        Sim, Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </AdminLayout >
    );
};

export default UserManagement;
