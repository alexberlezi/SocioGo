import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CircleDollarSign,
    ChevronLeft,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    FileText
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminLayout from '../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const MemberFinance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [id]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/finance/members/${id}/history`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch finance history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportXLSX = () => {
        if (!data) return;
        const { member, history } = data;

        const exportData = history.map(record => ({
            'Sócio': member.fullName || member.socialReason,
            'Descrição': record.description || 'Mensalidade',
            'Vencimento': new Date(record.dueDate).toLocaleDateString('pt-BR'),
            'Valor': parseFloat(record.amount),
            'Status': record.status === 'PAID' ? 'Pago' : record.status === 'PENDING' ? 'Pendente' : 'Atrasado',
            'Tipo': record.type
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Financeiro");
        XLSX.writeFile(wb, `Extrato_${member.id}_${new Date().getTime()}.xlsx`);
        toast.success('Excel gerado com sucesso!');
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        const { member, history, chartData } = data;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text('Extrato Financeiro Individual', 14, 22);

        // Member Info
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Associado: ${member.fullName || member.socialReason}`, 14, 32);
        doc.text(`Matrícula: #${member.id.toString().padStart(4, '0')}`, 14, 38);
        doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 44);

        // Metrics from Chart
        const totalPaid = chartData.reduce((acc, curr) => acc + curr.pago, 0);
        const totalPending = chartData.reduce((acc, curr) => acc + curr.pendente, 0);

        doc.text(`Total Pago (12m): R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 54);
        doc.text(`Total Pendente: R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 60);

        // History Table
        autoTable(doc, {
            startY: 70,
            head: [['Descrição', 'Vencimento', 'Valor', 'Status']],
            body: history.map(record => [
                record.description || 'Mensalidade',
                new Date(record.dueDate).toLocaleDateString('pt-BR'),
                `R$ ${parseFloat(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                record.status === 'PAID' ? 'Pago' : record.status === 'PENDING' ? 'Pendente' : 'Atrasado'
            ]),
            styles: { fontSize: 10 },
            headStyles: { fillStyle: [37, 99, 235] } // blue-600
        });

        doc.save(`extrato-${member.id}-${new Date().getTime()}.pdf`);
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

    if (!data) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Erro ao carregar dados</h2>
                    <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Voltar</button>
                </div>
            </AdminLayout>
        );
    }

    const { member, history, chartData } = data;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'OVERDUE': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PAID': return 'Pago';
            case 'PENDING': return 'Pendente';
            case 'OVERDUE': return 'Atrasado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'PENDING': return 'text-yellow-600 bg-yellow-500/20 border-yellow-500/30';
            case 'OVERDUE': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-400" />
                        </button>
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl transition-all duration-300 ${member.status === 'APPROVED' || member.status === 'ACTIVE'
                                    ? 'shadow-green-500/20'
                                    : 'shadow-yellow-500/20'
                                    }`}>
                                    {member.photo ? (
                                        <img src={member.photo} alt={member.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                            {member.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white dark:border-slate-900 rounded-full ${member.status === 'APPROVED' || member.status === 'ACTIVE'
                                    ? 'bg-green-500'
                                    : 'bg-yellow-500'
                                    }`}></div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        {member.fullName || member.socialReason}
                                    </h1>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${member.status === 'APPROVED' || member.status === 'ACTIVE'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {member.status === 'APPROVED' || member.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-md">
                                        Matrícula #{member.id.toString().padStart(4, '0')}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">•</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wide">
                                        {member.jobRole || (member.type === 'PJ' ? 'Empresa' : 'Sócio')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                            onClick={handleExportXLSX}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Exportar Excel</span>
                        </button>
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                        >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
                        </button>
                    </div>
                </div>

                {/* Stats & Chart Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Metrics Cards */}
                    <div className="xl:col-span-1 flex flex-col gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Anual</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Pago (12m)</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                R$ {chartData.reduce((acc, curr) => acc + curr.pago, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">Pendente</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total em Aberto</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                R$ {chartData.reduce((acc, curr) => acc + curr.pendente, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <CircleDollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 rotate-12" />
                            <p className="text-blue-100 text-sm font-medium relative z-10">Próximo Vencimento</p>
                            <h3 className="text-2xl font-black text-white mt-1 relative z-10">
                                {history.find(r => r.status === 'PENDING')
                                    ? new Date(history.find(r => r.status === 'PENDING').dueDate).toLocaleDateString('pt-BR')
                                    : 'Sem pendências'}
                            </h3>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Histórico Financeiro (12 Meses)
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pago</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendente</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            backgroundColor: '#1e293b',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar
                                        name="Pago"
                                        dataKey="pago"
                                        fill="#22c55e"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                    <Bar
                                        name="Pendente"
                                        dataKey="pendente"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
                    <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimos Lançamentos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800/50">
                                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Vencimento</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Valor</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                    {record.description || 'Mensalidade Associativa'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                    ID #{record.id.toString().padStart(6, '0')} • {record.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                {new Date(record.dueDate).toLocaleDateString('pt-BR')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                R$ {parseFloat(record.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {getStatusText(record.status)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase hover:underline">
                                                Visualizar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default MemberFinance;
