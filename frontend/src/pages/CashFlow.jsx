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
    ChevronRight
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';

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

const DatePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const [viewDate, setViewDate] = useState(parseLocalDate(value));
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const isSelected = (day) => {
        if (!value) return false;
        const d = parseLocalDate(value);
        return d.getDate() === day &&
            d.getMonth() === viewDate.getMonth() &&
            d.getFullYear() === viewDate.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const days = [];
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return (
        <div className="relative mt-1.5" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${isOpen
                    ? 'border-blue-500 ring-4 ring-blue-500/10'
                    : 'border-transparent dark:border-blue-500/50'
                    } text-gray-900 dark:text-slate-200`}
            >
                <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>{formatDateDisplay(value) || "DD/MM/AAAA"}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 scale-110' : ''}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-gray-400'}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 md:right-auto md:w-80 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[150] animate-in fade-in slide-in-from-top-2 duration-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </h4>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, idx) => (
                            <div key={idx} className="h-9 flex items-center justify-center">
                                {day && (
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${isSelected(day)
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : isToday(day)
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const CategorySelect = ({ value, options, onChange, placeholder, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const selectedOption = (options || []).find(opt => String(opt.id) === String(value));
    const filteredOptions = (options || []).filter(opt => opt.type === type);

    return (
        <div className="relative mt-1.5 group/select" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-5 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${isOpen
                    ? 'border-blue-500 ring-4 ring-blue-500/10'
                    : 'border-transparent dark:border-blue-500/50'
                    } ${selectedOption ? 'text-gray-900 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}
            >
                <div className="flex items-center gap-3">
                    {selectedOption ? (
                        <>
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm shadow-black/20" style={{ backgroundColor: selectedOption.color }}></div>
                            <span>{selectedOption.name}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span>{placeholder}</span>
                        </div>
                    )}
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 scale-110' : ''}`}>
                    <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-gray-400 group-hover/select:text-blue-500'}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[110] overflow-hidden origin-top transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                <div className="p-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all gap-3 ${String(value) === String(option.id)
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                    }`}
                            >
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }}></div>
                                <span className="flex-1 text-left">{option.name}</span>
                                {String(value) === String(option.id) && <Check className="w-4 h-4" />}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-50">
                            Nenhuma categoria encontrada
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CashFlow = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ entries: [], summary: { totalIn: 0, totalOut: 0, balance: 0 } });
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Entry Form State
    const [newEntry, setNewEntry] = useState({
        description: '',
        amount: '',
        date: getLocalDateString(),
        type: 'IN', // IN or OUT
        categoryId: ''
    });

    useEffect(() => {
        fetchCashFlow();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
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
            const response = await fetch('http://localhost:3000/api/cashflow');
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

        // Prepare clean data for backend
        const submissionData = {
            ...newEntry,
            amount: parseFloat(newEntry.amount.toString().replace(',', '.')),
            categoryId: parseInt(newEntry.categoryId)
        };

        console.log('Sending transaction data:', submissionData);

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
                            onClick={() => setIsModalOpen(true)}
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
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
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
                                        <td className="px-8 py-5 text-right">
                                            <span className={`text-sm font-black ${entry.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.type === 'IN' ? '+' : '-'} R$ {Number(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
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
                                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Novo Lançamento</h1>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateEntry} className="p-8 space-y-6">
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
                                        <CategorySelect
                                            value={newEntry.categoryId}
                                            options={categories}
                                            type={newEntry.type}
                                            placeholder="Selecione uma categoria..."
                                            onChange={(id) => setNewEntry({ ...newEntry, categoryId: id })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
                                >
                                    <Check className="w-5 h-5" />
                                    Confirmar Lançamento
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CashFlow;
