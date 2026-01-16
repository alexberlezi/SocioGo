import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import {
    Search, Filter, ChevronDown, Download,
    ChevronLeft, ChevronRight, SlidersHorizontal,
    Eye, Edit, Ban, CheckCircle, FileText, Check, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// --- Helper Hook: Click Outside ---
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

// --- Component: Custom Filter Dropdown ---
const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setIsOpen(false));

    const currentLabel = options.find(opt => opt.value === value)?.label || label;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all w-full md:w-auto min-w-[160px] justify-between ${isOpen ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-slate-100 dark:border-slate-700'}`}
            >
                <div className="flex items-center gap-2 shrink-0">
                    {Icon && <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                    <span className="truncate">{currentLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute left-0 mt-2 w-full md:w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden origin-top transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="p-1.5 space-y-0.5">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors bg-transparent ${value === option.value
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
                                }`}
                        >
                            {option.color && (
                                <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`}></span>
                            )}
                            {option.label}
                            {value === option.value && <Check className="w-3.5 h-3.5 ml-auto text-blue-600 dark:text-blue-400" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Component: Pagination Dropdown ---
const PaginationDropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setIsOpen(false));

    const currentOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all min-w-[140px] justify-between ${isOpen ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-slate-100 dark:border-slate-700'}`}
            >
                <span>{currentOption?.label || `${value} por página`}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute bottom-full mb-2 left-0 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden origin-bottom transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                <div className="p-1 space-y-0.5">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors bg-transparent ${value === option.value
                                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
                                }`}
                        >
                            {option.label}
                            {value === option.value && <Check className="w-3.5 h-3.5 ml-auto text-white" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SuspendModal = ({ isOpen, onClose, onConfirm, memberName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100 dark:border-red-900/30 transform transition-all scale-100 opacity-100">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban className="w-8 h-8 text-red-600 dark:text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Suspender Sócio?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Você tem certeza que deseja suspender <strong>{memberName}</strong>? <br />
                        O usuário perderá acesso imediato ao portal.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-colors"
                        >
                            Sim, Suspender
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component: ColumnsDropdown ---
const ColumnsDropdown = ({ visibleColumns, toggleColumn, labels, onReset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setIsOpen(false));

    const activeCount = Object.values(visibleColumns).filter(Boolean).length;

    const handleSelectAll = () => {
        Object.keys(visibleColumns).forEach(key => {
            if (!visibleColumns[key]) toggleColumn(key);
        });
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${isOpen ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-slate-100 dark:border-slate-700'}`}
            >
                <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Ver Colunas</span>
                {activeCount > 0 && (
                    <span className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full">
                        {activeCount}
                    </span>
                )}
            </button>

            <div className={`absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden origin-top transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Exibir/Ocultar</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-md">{activeCount} ativos</span>
                </div>

                <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {Object.keys(visibleColumns).map(col => (
                        <label
                            key={col}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 group"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleColumn(col);
                            }}
                        >
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${visibleColumns[col] ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                                {visibleColumns[col] && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`font-medium ${visibleColumns[col] ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {labels[col]}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-2 gap-2">
                    <button onClick={handleSelectAll} className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        Selecionar Todas
                    </button>
                    <button
                        onClick={onReset}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Padrão
                    </button>
                </div>
            </div>
        </div>
    );
};

const MembersList = () => {
    const navigate = useNavigate();

    // Data State
    const [members, setMembers] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
    const [loading, setLoading] = useState(true);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'ALL',
        type: 'ALL',
        limit: 10
    });

    // Modal State
    const [suspendModal, setSuspendModal] = useState({ isOpen: false, memberId: null, memberName: '' });

    // UI State
    const initialColumns = {
        // Fixed columns: Name, Status, Actions, Role/Education
        // Optional columns:
        type: true,
        doc: false,
        email: true,
        phone: false,
        city: true,
        createdAt: false,
        company: false
    };

    const [visibleColumns, setVisibleColumns] = useState(initialColumns);

    // Fetch Data
    const fetchMembers = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: filters.limit,
                q: searchTerm,
                ...(filters.status !== 'ALL' && { status: filters.status }),
                ...(filters.type !== 'ALL' && { type: filters.type }),
            });

            const response = await fetch(`http://localhost:3000/api/admin/members?${params}`);
            if (response.ok) {
                const result = await response.json();
                setMembers(result.data);
                setMeta(result.meta);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMembers(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filters]);

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.lastPage) {
            fetchMembers(newPage);
        }
    };

    const toggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    const handleResetColumns = () => {
        setVisibleColumns(initialColumns);
    };

    const handleSuspendClick = (member) => {
        const name = member.profile?.type === 'PF' ? member.profile?.fullName : member.profile?.socialReason;
        setSuspendModal({ isOpen: true, memberId: member.id, memberName: name });
    };

    const confirmSuspend = async () => {
        if (!suspendModal.memberId) return;

        const promise = fetch(`http://localhost:3000/api/admin/members/${suspendModal.memberId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'SUSPENDED' })
        }).then(async (res) => {
            if (!res.ok) throw new Error('Falha ao suspender');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Suspendendo sócio...',
            success: 'Sócio suspenso com sucesso!',
            error: 'Erro ao suspender sócio.'
        });

        try {
            await promise;
            setSuspendModal({ isOpen: false, memberId: null, memberName: '' });
            fetchMembers(meta.page); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'SUSPENDED': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'APPROVED': return 'Ativo';
            case 'PENDING': return 'Pendente';
            case 'REJECTED': return 'Recusado';
            case 'SUSPENDED': return 'Suspenso';
            default: return status;
        }
    };

    const columnLabels = {
        type: 'Tipo',
        doc: 'CPF/CNPJ',
        email: 'E-mail',
        phone: 'Telefone',
        city: 'Cidade/UF',
        createdAt: 'Data de Adesão',
        company: 'Empresa',
    };

    // Filter Options
    const statusOptions = [
        { value: 'ALL', label: 'Todos os Status', color: 'bg-gray-400' },
        { value: 'APPROVED', label: 'Ativos', color: 'bg-green-500' },
        { value: 'PENDING', label: 'Pendentes', color: 'bg-yellow-500' },
        { value: 'SUSPENDED', label: 'Suspensos', color: 'bg-gray-600' },
        { value: 'REJECTED', label: 'Recusados', color: 'bg-red-500' }
    ];

    const typeOptions = [
        { value: 'ALL', label: 'Todos os Tipos' },
        { value: 'PF', label: 'Pessoa Física', color: 'bg-blue-500' },
        { value: 'PJ', label: 'Pessoa Jurídica', color: 'bg-purple-500' }
    ];

    const limitOptions = [
        { value: 10, label: '10 por página' },
        { value: 25, label: '25 por página' },
        { value: 50, label: '50 por página' },
        { value: 100, label: '100 por página' }
    ];

    // Export Logic
    const handleExport = async (type) => {
        const toastId = toast.loading('Preparando relatório...');
        try {
            // Fetch all filtered data (limit: 1000 for safety)
            const params = new URLSearchParams({
                page: 1,
                limit: 1000,
                q: searchTerm,
                ...(filters.status !== 'ALL' && { status: filters.status }),
                ...(filters.type !== 'ALL' && { type: filters.type }),
            });

            const response = await fetch(`http://localhost:3000/api/admin/members?${params}`);
            if (!response.ok) throw new Error('Falha ao buscar dados');

            const result = await response.json();
            const dataToExport = result.data;

            if (dataToExport.length === 0) {
                toast.error('Nenhum dado encontrado para os filtros atuais.', { id: toastId });
                return;
            }

            const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            const filename = `SocioGo_Relatorio_Socios_${dateStr}`;

            const allColumns = [
                { key: 'partner', label: 'Sócio', show: true },
                { key: 'type', label: 'Tipo', show: visibleColumns.type },
                { key: 'doc', label: 'Documento', show: visibleColumns.doc },
                { key: 'job', label: 'Cargo/Formação', show: true },
                { key: 'status', label: 'Status', show: true },
                { key: 'email', label: 'E-mail', show: visibleColumns.email },
                { key: 'phone', label: 'Telefone', show: visibleColumns.phone },
                { key: 'city', label: 'Cidade/UF', show: visibleColumns.city },
                { key: 'company', label: 'Empresa', show: visibleColumns.company },
                { key: 'createdAt', label: 'Cadastro', show: visibleColumns.createdAt }
            ];

            const activeExportCols = allColumns.filter(c => c.show);

            const getRowData = (m) => {
                const row = {};
                const map = {
                    'partner': m.profile?.type === 'PF' ? m.profile?.fullName : m.profile?.socialReason,
                    'type': m.profile?.type,
                    'doc': m.profile?.type === 'PF' ? m.profile?.cpf : m.profile?.cnpj,
                    'job': m.profile?.type === 'PF' ? (m.profile?.jobRole || m.profile?.education || '-') : (m.profile?.activityBranch || '-'),
                    'status': getStatusLabel(m.status),
                    'email': m.email,
                    'phone': m.profile?.phone || '-',
                    'city': m.profile?.city ? `${m.profile?.city}/${m.profile?.state}` : '-',
                    'company': m.profile?.currentCompany || '-',
                    'createdAt': new Date(m.createdAt).toLocaleDateString('pt-BR')
                };
                activeExportCols.forEach(col => {
                    row[col.label] = map[col.key];
                });
                return row;
            };

            if (type === 'excel') {
                const wsData = dataToExport.map(getRowData);
                const ws = XLSX.utils.json_to_sheet(wsData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sócios");
                XLSX.writeFile(wb, `${filename}.xlsx`);
            }
            else if (type === 'pdf') {
                const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

                // Header
                doc.setFillColor(37, 99, 235); // Blue 600
                doc.rect(0, 0, 297, 24, 'F');

                // Logo Placeholder
                doc.setFillColor(255, 255, 255);
                doc.circle(20, 12, 8, 'F');
                doc.setFontSize(8);
                doc.setTextColor(37, 99, 235);
                doc.text("LOGO", 16.5, 13);

                doc.setFontSize(18);
                doc.setTextColor(255, 255, 255);
                doc.text("Relatório de Sócios - SocioGo", 35, 16);

                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 280, 16, { align: 'right' });

                // Table
                const tableHead = activeExportCols.map(c => c.label);
                const tableBody = dataToExport.map(m => {
                    const row = getRowData(m);
                    return tableHead.map(label => row[label]);
                });

                autoTable(doc, {
                    head: [tableHead],
                    body: tableBody,
                    startY: 32,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [37, 99, 235], // Blue 600
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    alternateRowStyles: { fillColor: [248, 250, 252] }
                });

                doc.save(`${filename}.pdf`);
            }

            toast.success('Download iniciado!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao exportar dados.', { id: toastId });
        }
    };

    return (
        <AdminLayout>
            <SuspendModal
                isOpen={suspendModal.isOpen}
                onClose={() => setSuspendModal({ isOpen: false, memberId: null, memberName: '' })}
                onConfirm={confirmSuspend}
                memberName={suspendModal.memberName}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Sócios</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Gerencie a base de membros, exporte dados e realize ações administrativas.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exportar Excel</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                    >
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">

                {/* Search & Global Filters */}
                <div className="flex flex-col md:flex-row gap-3 flex-1">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Busca Rápida..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium"
                        />
                    </div>

                    <FilterDropdown
                        label="Filtrar por Status"
                        value={filters.status}
                        options={statusOptions}
                        onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        icon={Filter}
                    />

                    <FilterDropdown
                        label="Filtrar por Tipo"
                        value={filters.type}
                        options={typeOptions}
                        onChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                    />

                    {(searchTerm || filters.status !== 'ALL' || filters.type !== 'ALL') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilters(prev => ({ ...prev, status: 'ALL', type: 'ALL' }));
                            }}
                            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl transition-colors whitespace-nowrap"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                {/* view options */}
                <div className="relative">
                    <ColumnsDropdown
                        visibleColumns={visibleColumns}
                        toggleColumn={toggleColumn}
                        labels={columnLabels}
                        onReset={handleResetColumns}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col w-full">
                <div className="overflow-x-auto min-w-full rounded-t-xl overflow-hidden">
                    <table className="w-full min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-100 dark:bg-slate-800 z-10 w-[200px] md:w-[300px]">Sócio</th>
                                {visibleColumns.type && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap w-24">Tipo</th>}
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Formação/Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Status</th>

                                {visibleColumns.doc && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">CPF/CNPJ</th>}
                                {visibleColumns.email && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-mail</th>}
                                {visibleColumns.phone && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</th>}
                                {visibleColumns.city && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Cidade/UF</th>}
                                {visibleColumns.company && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empresa</th>}
                                {visibleColumns.createdAt && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Adesão</th>}

                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right sticky right-0 bg-gray-100 dark:bg-slate-800 z-10 w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="12" className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : members.length > 0 ? (
                                members.map((member, index) => (
                                    <tr key={member.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-900/50'} hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group`}>
                                        {/* Fixed Column: Partner Name */}
                                        <td className="px-6 py-4 sticky left-0 bg-inherit z-10">
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                                                {member.profile?.type === 'PF' ? member.profile?.fullName : member.profile?.socialReason}
                                            </div>
                                            {member.profile?.type && !visibleColumns.type && ( // Fallback show if column hidden? No, just hide it.
                                                null
                                            )}
                                        </td>

                                        {/* Toggleable Column: Type */}
                                        {visibleColumns.type && (
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${member.profile?.type === 'PF' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'}`}>
                                                    {member.profile?.type}
                                                </span>
                                            </td>
                                        )}

                                        {/* Fixed Column: Role/Education */}
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {member.profile?.type === 'PF'
                                                ? (member.profile?.jobRole || member.profile?.education || '-')
                                                : (member.profile?.activityBranch || '-')}
                                        </td>

                                        {/* Fixed Column: Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(member.status)}`}>
                                                {getStatusLabel(member.status)}
                                            </span>
                                        </td>

                                        {/* Optional Columns */}
                                        {visibleColumns.doc && (
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
                                                {member.profile?.type === 'PF' ? member.profile?.cpf : member.profile?.cnpj}
                                            </td>
                                        )}
                                        {visibleColumns.email && (
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {member.email}
                                            </td>
                                        )}
                                        {visibleColumns.phone && (
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {member.profile?.phone || '-'}
                                            </td>
                                        )}
                                        {visibleColumns.city && (
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {member.profile?.city ? `${member.profile.city}/${member.profile.state}` : '-'}
                                            </td>
                                        )}
                                        {visibleColumns.company && (
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {member.profile?.currentCompany || '-'}
                                            </td>
                                        )}
                                        {visibleColumns.createdAt && (
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(member.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                        )}

                                        {/* Fixed Column: Actions (Always visible) */}
                                        <td className="px-6 py-4 text-right sticky right-0 bg-inherit z-10 w-32">
                                            <div className="flex items-center justify-end gap-1">
                                                <button title="Ver Carteirinha" className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/members/${member.id}/edit`)}
                                                    title="Editar"
                                                    className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {member.status !== 'SUSPENDED' ? (
                                                    <button
                                                        onClick={() => handleSuspendClick(member)}
                                                        title="Suspender"
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        title="Suspenso"
                                                        disabled
                                                        className="p-1.5 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded-full transition-colors"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                                        Nenhum sócio encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-b-xl">
                    <div className="text-sm text-gray-500">
                        Mostrando <span className="font-bold text-gray-900 dark:text-white">{(meta.page - 1) * filters.limit + 1}</span> a <span className="font-bold text-gray-900 dark:text-white">{Math.min(meta.page * filters.limit, meta.total)}</span> de <span className="font-bold text-gray-900 dark:text-white">{meta.total}</span> registros
                    </div>

                    <div className="flex items-center gap-4">
                        <PaginationDropdown
                            value={filters.limit}
                            options={limitOptions}
                            onChange={(val) => setFilters(prev => ({ ...prev, limit: Number(val) }))}
                        />

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(meta.page - 1)}
                                disabled={meta.page === 1}
                                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Página {meta.page} de {meta.lastPage || 1}
                            </span>
                            <button
                                onClick={() => handlePageChange(meta.page + 1)}
                                disabled={meta.page === meta.lastPage}
                                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default MembersList;
