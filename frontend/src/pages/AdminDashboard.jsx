import React, { useState, useEffect } from 'react';
import MemberApprovalCard from '../components/MemberApprovalCard';
import AdminLayout from '../components/layout/AdminLayout';
import { Users, Filter, Search } from 'lucide-react';

const AdminDashboard = () => {
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPendingMembers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/pending-members');
            if (response.ok) {
                const data = await response.json();
                setPendingMembers(data);
            } else {
                console.error('Failed to fetch pending members');
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingMembers();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Tem certeza que deseja aprovar este cadastro?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/admin/approve-member/${id}`, {
                method: 'PATCH'
            });

            if (response.ok) {
                alert('Cadastro aprovado com sucesso!');
                fetchPendingMembers(); // Refresh list
            } else {
                alert('Erro ao aprovar cadastro.');
            }
        } catch (error) {
            console.error('Error approving:', error);
            alert('Erro ao processar aprovação.');
        }
    };

    const handleReject = async (id, reason) => {
        if (!reason) {
            alert('Por favor, informe um motivo para a recusa.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/admin/reject-member/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                alert('Cadastro recusado com sucesso.');
                fetchPendingMembers(); // Refresh list
            } else {
                alert('Erro ao recusar cadastro.');
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Erro ao processar recusa.');
        }
    };

    // Filter logic
    const filteredMembers = pendingMembers.filter(member => {
        if (!member.profile) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            member.profile.fullName?.toLowerCase().includes(searchLower) ||
            member.profile.socialReason?.toLowerCase().includes(searchLower) ||
            member.profile.cpf?.includes(searchTerm) ||
            member.profile.cnpj?.includes(searchTerm) ||
            member.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <AdminLayout>
            {/* Stats / Header Area */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aprovação de Sócios</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os novos pedidos de cadastro.</p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF, e-mail..."
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Carregando solicitações...</p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="bg-gray-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Nenhum cadastro pendente</h3>
                    <p className="text-gray-500 dark:text-gray-400">Todas as solicitações foram processadas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-6">
                        {filteredMembers.map(member => (
                            <MemberApprovalCard
                                key={member.id}
                                member={member}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
