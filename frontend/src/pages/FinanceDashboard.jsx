import React, { useState, useEffect } from 'react';
import {
    CircleDollarSign,
    TrendingUp,
    AlertTriangle,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    MessageSquare,
    Mail,
    Phone,
    Download,
    FileSpreadsheet,
    Filter
} from 'lucide-react';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LabelList,
    Cell
} from 'recharts';
import AdminLayout from '../components/layout/AdminLayout';
import api from '../utils/api';

const FinanceDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchDashboardData();

        // Listen for tenant changes and auto-refresh
        const handleTenantChange = () => {
            setLoading(true);
            fetchDashboardData();
        };
        window.addEventListener('tenantChanged', handleTenantChange);
        return () => window.removeEventListener('tenantChanged', handleTenantChange);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/api/finance/dashboard');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch finance dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500 font-bold animate-pulse">Carregando painel financeiro...</p>
                </div>
            </AdminLayout>
        );
    }

    const { metrics, chartData, expenseDistribution, upcoming, critical } = data;
    const totalExpenses = expenseDistribution.reduce((sum, item) => sum + item.value, 0);

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const percentage = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0;
            return (
                <div className="bg-[#111827] p-3 rounded-xl shadow-2xl border border-slate-800">
                    <p className="text-white font-bold text-xs uppercase tracking-tight mb-1">{payload[0].name}</p>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-400 text-[10px] font-black uppercase">Valor</span>
                        <span className="text-white font-bold text-xs">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-400 text-[10px] font-black uppercase">Fatia</span>
                        <span className="text-blue-400 font-bold text-xs">{percentage}%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const handleWhatsAppCharge = (phone, memberName, amount) => {
        if (!phone) {
            alert('Telefone não cadastrado para este sócio.');
            return;
        }
        const message = `Olá ${memberName}, notamos um pagamento pendente no valor de R$ ${amount}. Gostaria de ajuda para regularizar?`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestão Financeira</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Controle total sobre receitas, inadimplência e projeções futuras.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Relatório Geral</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <ArrowUpRight className="w-3 h-3" />
                                12%
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative z-10">Receita Mês</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 relative z-10">
                            R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <CircleDollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-100 dark:text-slate-800 opacity-50 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                <ArrowUpRight className="w-3 h-3" />
                                5%
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative z-10">Inadimplência</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 relative z-10">
                            R$ {metrics.delinquency.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative z-10">Projeção Próx. Mês</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 relative z-10">
                            R$ {metrics.projection.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                Novos
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider relative z-10">Novos Sócios (Mês)</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1 relative z-10">
                            {metrics.newMembers}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Performance Chart */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Desempenho de Arrecadação
                                </h3>
                                <p className="text-gray-500 text-xs font-bold uppercase mt-1 tracking-wider">Últimos 6 meses de faturamento</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pago</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendente</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[350px] min-h-[350px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B', textAnchor: 'middle' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            backgroundColor: '#111827',
                                            color: '#fff',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="pago" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={32}>
                                        <LabelList
                                            dataKey="pago"
                                            position="top"
                                            fill="#fff"
                                            fontSize={9}
                                            fontWeight="bold"
                                            formatter={(val) => val > 0 ? `R$ ${Math.round(val)}` : ''}
                                            offset={10}
                                        />
                                    </Bar>
                                    <Bar dataKey="pendente" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={32}>
                                        <LabelList
                                            dataKey="pendente"
                                            position="top"
                                            fill="#fff"
                                            fontSize={9}
                                            fontWeight="bold"
                                            formatter={(val) => val > 0 ? `R$ ${Math.round(val)}` : ''}
                                            offset={10}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Expense Distribution Chart */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                                    Distribuição de Despesas
                                </h3>
                                <p className="text-gray-500 text-xs font-bold uppercase mt-1 tracking-wider">Ganhos por categoria (Mês)</p>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row items-center gap-8 min-h-[350px]">
                            <div className="flex-1 w-full h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {expenseDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">
                                        R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full md:w-48 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {expenseDistribution.sort((a, b) => b.value - a.value).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between gap-3 group">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 truncate uppercase tracking-tight">{item.name}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-900 dark:text-white whitespace-nowrap">
                                            R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                                {expenseDistribution.length === 0 && (
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-8 opacity-50">Sem despesas registradas</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Alerts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

                    {/* Next Due Dates */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Próximos Vencimentos
                            </h3>
                        </div>
                        <div className="flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-slate-800">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sócio</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {upcoming.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate block max-w-[200px]">
                                                    {item.memberName}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-white">
                                                R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {upcoming.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-10 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">Sem lançamentos próximos</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Critical Delays */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/10">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-500 uppercase tracking-tight flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Atrasos Críticos
                            </h3>
                        </div>
                        <div className="flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-slate-800">
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sócio</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Atraso</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {critical.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate block max-w-[200px]">
                                                        {item.memberName}
                                                    </span>
                                                    <span className="text-[10px] font-black text-red-500">
                                                        R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg">
                                                    {item.daysOverdue} DIAS
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleWhatsAppCharge(item.phone, item.memberName, item.amount)}
                                                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-lg shadow-green-500/10 group relative"
                                                        title="Cobrar via WhatsApp"
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                        </svg>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                                            Cobrar via WhatsApp
                                                        </span>
                                                    </button>
                                                    <button
                                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/10 group relative"
                                                        title="Enviar Lembrete por E-mail"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                                            Enviar Lembrete por E-mail
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {critical.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-10 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">Nenhum atraso crítico</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FinanceDashboard;
