import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingUp,
    TrendingDown,
    Calendar,
    Tag,
    X,
    Filter,
    Download,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    User as UserIcon,
    History,
    Lock as LockIcon,
    AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

// --- Custom Hook: Click Outside ---
const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

import DatePicker from '../components/ui/DatePicker';
import CustomSelect from '../components/ui/CustomSelect';

const CashFlow = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ entries: [], summary: { totalIn: 0, totalOut: 0, balance: 0 } });
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);

    // Monthly Closure State
    const [monthStatus, setMonthStatus] = useState('OPEN'); // 'OPEN' | 'CLOSED'

    // New Entry Form State
    const [newEntry, setNewEntry] = useState({
        description: '',
        amount: '',
        date: getLocalDateString(),
        type: 'IN', // IN or OUT
        categoryId: ''
    });

    // Placeholder for filters, as it's used in the new useEffect
    const [filters, setFilters] = useState({
        dateRange: { start: '', end: '' },
        type: '',
        categoryId: ''
    });

    const fetchMonthStatus = async () => {
        try {
            const date = Object.values(filters.dateRange).some(d => d)
                ? filters.dateRange.start
                : new Date().toISOString().split('T')[0];

            const response = await api.get(`/api/finance/closure/check?date=${date}`);
            if (response.ok) {
                const data = await response.json();
                setMonthStatus(data.status);
            }
        } catch (error) {
            console.error('Error fetching month status:', error);
        }
    };

    useEffect(() => {
        fetchMonthStatus();
    }, [filters.dateRange]); // Re-check when date filters change

    useEffect(() => {
        fetchCashFlow();
        fetchCategories();

        // Listen for tenant changes and auto-refresh
        const handleTenantChange = () => {
            setLoading(true);
            fetchCashFlow();
            fetchCategories();
        };
        window.addEventListener('tenantChanged', handleTenantChange);
        return () => window.removeEventListener('tenantChanged', handleTenantChange);
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            if (response.ok) {
                const result = await response.json();
                setCategories(result);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchCashFlow = async () => {
        try {
            const response = await api.get('/api/cashflow');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch cash flow:', error);
            toast.error('Erro ao carregar movimentações');
        } finally {
            setLoading(false);
        }
    };

    const handleAmountBlur = () => {
        if (!newEntry.amount) return;
        // Basic format: ensure it has 2 decimal places when losing focus
        const value = parseFloat(newEntry.amount.toString().replace(',', '.'));
        if (!isNaN(value)) {
            setNewEntry({ ...newEntry, amount: value.toFixed(2).replace('.', ',') });
        }
    };

    const handleCreateEntry = async (e) => {
        e.preventDefault();

        const submissionData = {
            ...newEntry,
            amount: parseFloat(newEntry.amount.toString().replace(',', '.')),
            categoryId: parseInt(newEntry.categoryId),
            operatorName: 'Admin User', // Hardcoded for now, can be dynamic from auth context later
            operatorId: 1 // Hardcoded for now
        };

        try {
            const response = await fetch('http://localhost:3000/api/cashflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                toast.success('Lançamento realizado com sucesso!');
                setIsModalOpen(false);
                setNewEntry({
                    description: '',
                    amount: '',
                    date: getLocalDateString(),
                    type: 'IN',
                    categoryId: ''
                });
                fetchCashFlow();
            } else {
                toast.error('Erro ao realizar lançamento');
            }
        } catch (error) {
            console.error('Error creating entry:', error);
            toast.error('Erro de conexão');
        }
    };

    const handleUpdateEntry = async (e) => {
        e.preventDefault();

        const submissionData = {
            ...newEntry,
            amount: parseFloat(newEntry.amount.toString().replace(',', '.')),
            categoryId: parseInt(newEntry.categoryId),
            operatorName: 'Admin User',
            operatorId: 1
        };

        try {
            const response = await fetch(`http://localhost:3000/api/cashflow/${editingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                toast.success('Lançamento atualizado com sucesso!');
                setIsModalOpen(false);
                setEditingEntry(null);
                setNewEntry({
                    description: '',
                    amount: '',
                    date: getLocalDateString(),
                    type: 'IN',
                    categoryId: ''
                });
                fetchCashFlow();
            } else {
                toast.error('Erro ao atualizar lançamento');
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            toast.error('Erro de conexão');
        }
    };

    const handleDeleteEntry = async () => {
        if (!entryToDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/api/cashflow/${entryToDelete.id}?operatorId=1&operatorName=Admin User`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Lançamento excluído com sucesso!');
                setIsDeleteModalOpen(false);
                setEntryToDelete(null);
                fetchCashFlow();
            } else {
                toast.error('Erro ao excluir lançamento');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            toast.error('Erro de conexão');
        }
    };

    const openEditModal = (entry) => {
        setEditingEntry(entry);
        setNewEntry({
            description: entry.description,
            amount: entry.amount.toString().replace('.', ','),
            date: entry.date.split('T')[0],
            type: entry.type,
            categoryId: entry.categoryId
        });
        setIsModalOpen(true);
    };

    const openDeleteModal = (entry) => {
        setEntryToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const openCreateModal = () => {
        setNewEntry({
            description: '',
            amount: '',
            date: getLocalDateString(),
            type: 'IN',
            categoryId: ''
        });
        setEditingEntry(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Fluxo de Caixa</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gestão manual de entradas, saídas e movimentações internas.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Novo Lançamento</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Income */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Total Receitas</p>
                        <h3 className="text-2xl font-black text-green-600 mt-1">
                            + R$ {data.summary.totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="w-16 h-16" />
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Total Despesas</p>
                        <h3 className="text-2xl font-black text-red-600 mt-1">
                            - R$ {data.summary.totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingDown className="w-16 h-16" />
                        </div>
                    </div>

                    {/* Period Balance */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">Saldo do Período</p>
                        <h3 className={`text-2xl font-black mt-1 ${data.summary.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                            R$ {data.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Wallet className="w-16 h-16" />
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
                    <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Histórico de Movimentações
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                <Filter className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-slate-800">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operador</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {data.entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                                {new Date(entry.date).toLocaleDateString('pt-BR')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                    {entry.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full"
                                                style={{
                                                    backgroundColor: entry.categoryRef ? `${entry.categoryRef.color}15` : '#f3f4f6',
                                                    color: entry.categoryRef ? entry.categoryRef.color : '#4b5563'
                                                }}
                                            >
                                                <Tag className="w-3 h-3 opacity-50" />
                                                {entry.categoryRef?.name || 'Sem Categoria'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                                    <UserIcon className="w-3 h-3 text-blue-500" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                                    {entry.operatorName || 'Admin User'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`text-sm font-black ${entry.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.type === 'IN' ? '+' : '-'} R$ {Number(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {monthStatus === 'CLOSED' ? (
                                                <div className="flex justify-end group/lock relative">
                                                    <LockIcon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none z-50 text-center font-bold">
                                                        Período encerrado. Procure o Administrador Global para reabertura
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(entry)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(entry)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.entries.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-sm">
                                            Nenhum lançamento encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Entry Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                        <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
                                </h1>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingEntry(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewEntry({ ...newEntry, type: 'IN' })}
                                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${newEntry.type === 'IN' ? 'bg-green-50 border-green-500 text-green-600' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400'}`}
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewEntry({ ...newEntry, type: 'OUT' })}
                                        className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${newEntry.type === 'OUT' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-transparent border-gray-100 dark:border-slate-800 text-gray-400'}`}
                                    >
                                        <ArrowDownRight className="w-4 h-4" />
                                        Saída
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição</label>
                                        <input
                                            type="text"
                                            required
                                            value={newEntry.description}
                                            onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                                            className="w-full mt-1.5 h-12 px-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent dark:border-slate-700/50 rounded-2xl text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="Ex: Pagamento de Fornecedor"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                                            <input
                                                type="text" // Change to text to allow comma display
                                                required
                                                value={newEntry.amount}
                                                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                                                onBlur={handleAmountBlur}
                                                className="w-full mt-1.5 h-12 px-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent dark:border-slate-700/50 rounded-2xl text-sm font-bold text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
                                            <DatePicker
                                                value={newEntry.date}
                                                onChange={(date) => setNewEntry({ ...newEntry, date })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
                                        <CustomSelect
                                            value={newEntry.categoryId}
                                            options={categories.filter(c => c.type === newEntry.type)}
                                            placeholder="Selecione uma categoria..."
                                            onChange={(id) => setNewEntry({ ...newEntry, categoryId: id })}
                                            icon={Tag}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingEntry ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* Deletion Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>

                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Excluir Lançamento?</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
                                    Deseja realmente excluir o lançamento de <span className="font-black text-red-500">R$ {Number(entryToDelete?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>? Esta ação ficará registrada no log de auditoria.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="h-12 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteEntry}
                                        className="h-12 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Excluir Agora
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CashFlow;
