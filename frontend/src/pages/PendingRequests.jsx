import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import PendingMemberCard from '../components/PendingMemberCard';
import { Search, Inbox } from 'lucide-react';

const PendingRequests = () => {
    const [pendingMembers, setPendingMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PF', 'PJ'

    useEffect(() => {
        fetchPendingMembers();
    }, []);

    const fetchPendingMembers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/pending-members');
            if (response.ok) {
                const data = await response.json();
                setPendingMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch pending members:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredMembers = pendingMembers.filter(member => {
        const matchesSearch =
            member.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.profile?.socialReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.profile?.cpf?.includes(searchTerm) ||
            member.profile?.cnpj?.includes(searchTerm);

        const matchesType = filterType === 'ALL' || member.profile?.type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <AdminLayout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fila de Aprovação</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Você tem <strong className="text-blue-600">{pendingMembers.length}</strong> solicitações aguardando revisão.
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF ou CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* Type Filters */}
                <div className="flex items-center bg-gray-50 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto">
                    {['ALL', 'PF', 'PJ'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`
                                flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all
                                ${filterType === type
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                            `}
                        >
                            {type === 'ALL' ? 'Todos' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="aspect-[1.58/1] bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                    ))}
                </div>
            ) : filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredMembers.map(member => (
                        <PendingMemberCard key={member.id} member={member} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Não há solicitações pendentes com os filtros atuais.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
};

export default PendingRequests;
