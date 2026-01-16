import React, { useState, useEffect, useRef } from 'react';
import {
    History,
    Calendar,
    User as UserIcon,
    Search,
    Filter,
    ArrowRight,
    X,
    ChevronDown,
    Calendar as CalendarIcon
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import DatePicker from '../components/ui/DatePicker';
import CustomSelect from '../components/ui/CustomSelect';

// --- Custom Hook: Click Outside ---
const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
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

const FinancialAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operators, setOperators] = useState([]);
    const [categories, setCategories] = useState({});

    // Filter State
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userId: ''
    });

    useEffect(() => {
        fetchLogs();
        fetchOperators();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            if (response.ok) {
                const data = await response.json();
                const catMap = data.reduce((acc, cat) => {
                    acc[cat.id] = cat.name;
                    return acc;
                }, {});
                setCategories(catMap);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.userId) params.append('userId', filters.userId);

            const response = await fetch(`http://localhost:3000/api/finance/logs?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Erro ao carregar logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchOperators = async () => {
        try {
            // Simplified: Fetch logs first and extract unique operators for the filter
            // In a real app, you'd fetch from /api/users, but this ensures we only filter by those who HAVE logs
            const response = await fetch('http://localhost:3000/api/finance/logs');
            if (response.ok) {
                const data = await response.json();
                const uniqueOperators = Array.from(new Set(data.filter(l => l.userId).map(log => JSON.stringify({ id: log.userId, name: log.userName }))))
                    .map(str => JSON.parse(str));
                setOperators(uniqueOperators);
            }
        } catch (error) {
            console.error('Failed to fetch operators:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        fetchLogs();
    };

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', userId: '' });
        // Can't just call fetchLogs because state hasn't updated yet
    };

    useEffect(() => {
        if (!filters.startDate && !filters.endDate && !filters.userId) {
            fetchLogs();
        }
    }, [filters]);

    const getActionBadge = (action) => {
        switch (action) {
            case 'CREATE':
                return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'UPDATE':
                return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'DELETE':
                return 'bg-red-500/10 text-red-500 border border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'CREATE': return 'INCLUSÃO';
            case 'UPDATE': return 'EDIÇÃO';
            case 'DELETE': return 'EXCLUSÃO';
            default: return action;
        }
    };

    const renderDetails = (log) => {
        if (log.action === 'UPDATE' && log.oldValue && log.newValue) {
            const changes = [];

            // Amount Change
            const oldAmt = Number(log.oldValue.amount);
            const newAmt = Number(log.newValue.amount);
            if (oldAmt !== newAmt) {
                changes.push(
                    <div key="amount" className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">Valor:</span>
                        <span className="text-gray-500 line-through">
                            R$ {oldAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-500 font-bold">
                            R$ {newAmt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                );
            }

            // Description Change
            if (log.oldValue.description !== log.newValue.description) {
                changes.push(
                    <div key="desc" className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">Desc:</span>
                        <span className="text-gray-500 line-through truncate max-w-[100px]" title={log.oldValue.description}>
                            {log.oldValue.description}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-500 font-bold truncate max-w-[100px]" title={log.newValue.description}>
                            {log.newValue.description}
                        </span>
                    </div>
                );
            }

            // Category Change
            if (log.oldValue.categoryId !== log.newValue.categoryId) {
                const oldCat = categories[log.oldValue.categoryId] || `ID ${log.oldValue.categoryId}`;
                const newCat = categories[log.newValue.categoryId] || `ID ${log.newValue.categoryId}`;
                changes.push(
                    <div key="cat" className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">Cat:</span>
                        <span className="text-gray-500 line-through">
                            {oldCat}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-500" />
                        <span className="text-amber-500 font-bold">
                            {newCat}
                        </span>
                    </div>
                );
            }

            if (changes.length > 0) {
                return <div className="flex flex-col gap-1">{changes}</div>;
            }
        }

        if (log.action === 'DELETE') {
            return <div className="flex items-center gap-2">
                <span className="text-red-500/70 text-xs italic">Registro removido permanentemente</span>
                {log.oldValue && (
                    <span className="text-gray-400 text-[10px]">(Valor: R$ {Number(log.oldValue.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                )}
            </div>;
        }

        if (log.action === 'CREATE') {
            return <span className="text-green-500/70 text-xs italic">Novo registro adicionado</span>;
        }

        return <span className="text-gray-400 dark:text-gray-600">---</span>;
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <History className="w-8 h-8 text-blue-600" />
                            Logs de Auditoria Financeira
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Rastreamento completo de todas as movimentações e alterações no sistema.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchLogs}
                            className="p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-500/30 transition-all shadow-sm"
                        >
                            <History className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Inicial</label>
                            <DatePicker
                                value={filters.startDate}
                                onChange={(date) => handleFilterChange('startDate', date)}
                                placeholder="Início"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Final</label>
                            <DatePicker
                                value={filters.endDate}
                                onChange={(date) => handleFilterChange('endDate', date)}
                                placeholder="Fim"
                            />
                        </div>

                        {/* Operator */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operador</label>
                            <CustomSelect
                                value={filters.userId}
                                options={[
                                    { id: '', name: 'Todos os Operadores' },
                                    ...operators
                                ]}
                                onChange={(id) => handleFilterChange('userId', id)}
                                placeholder="Selecione..."
                                icon={UserIcon}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={applyFilters}
                                className="flex-1 h-12 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Filtrar
                            </button>
                            <button
                                onClick={clearFilters}
                                className="w-12 h-12 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                                title="Limpar Filtros"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-slate-800">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-40">Data/Hora</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-48">Operador</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Ação</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Carregando logs...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400">
                                                        {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase truncate max-w-[120px]">
                                                        {log.userName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center w-24 ${getActionBadge(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed max-w-md">
                                                    {log.description}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right text-xs font-bold">
                                                {renderDetails(log)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-50">
                                                <History className="w-12 h-12 text-gray-300" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum registro encontrado</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FinancialAudit;
