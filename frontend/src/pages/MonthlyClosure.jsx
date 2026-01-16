import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Lock as LockIcon,
    Unlock,
    AlertTriangle,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    FileText
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../utils/api';

const MonthlyClosure = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthsData, setMonthsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [reopenReason, setReopenReason] = useState('');

    // Closure Modal State
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [monthToClose, setMonthToClose] = useState(null);

    const generatePDF = async (monthData) => {
        const toastId = toast.loading('Gerando relatório...');
        try {
            // Fetch Report Data
            const response = await api.get(`/api/finance/closure/report?month=${monthData.month}&year=${year}&userId=${user.id}`);
            if (!response.ok) {
                const text = await response.text();
                // Try to parse JSON error, fall back to text, fall back to default
                try {
                    const err = JSON.parse(text);
                    throw new Error(err.error || 'Falha na comunicação com o servidor');
                } catch (e) {
                    // If parsing failed, it might be an HTML error page or simple text
                    console.error('Erro Bruto do Servidor:', text);
                    throw new Error(`Erro do Servidor (${response.status}): ${text.substring(0, 50)}...`);
                }
            }
            const data = await response.json();
            console.log('Dados do Relatório:', data);

            if (!data || !data.summary) {
                throw new Error('Dados do relatório incompletos');
            }

            const doc = new jsPDF();

            // --- Header ---
            // Re-draw Header Background if we want full dark? 
            // Previous code had slate-900 rect. Let's keep it but adjust Logo.

            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 40, 'F');

            // Draw Logo ON TOP of dark header
            doc.setFillColor(59, 130, 246); // blue-500 brighter
            doc.circle(25, 20, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10); // optimized for small circle
            doc.text("SG", 25, 23, { align: 'center' }); // approximate center

            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text("SocioGo", 40, 20); // Moved right due to logo

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`BALANCETE MENSAL - ${monthsNames[data.month - 1].toUpperCase()} ${data.year}`, 40, 28);

            doc.text(`${monthsNames[data.month - 1]}/${data.year}`, 195, 20, { align: 'right' });
            if (data.closureDate) {
                const closedDate = new Date(data.closureDate).toLocaleDateString('pt-BR');
                doc.text(`Encerrado em: ${closedDate}`, 195, 28, { align: 'right' });
            }

            // --- Summary Blocks ---
            let yPos = 55;
            doc.setTextColor(51, 65, 85); // slate-700
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Resumo Financeiro", 15, yPos);

            yPos += 10;
            // Ensure values are numbers before formatting
            const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const summary = [
                { title: "Saldo Inicial", value: formatCurrency(data.summary.initialBalance), color: [100, 116, 139] }, // slate-500
                { title: "Entradas", value: formatCurrency(data.summary.totalIn), color: [34, 197, 94] }, // green-500
                { title: "Saídas", value: formatCurrency(data.summary.totalOut), color: [239, 68, 68] }, // red-500
                { title: "Saldo Líquido", value: formatCurrency(data.summary.finalBalance), color: [37, 99, 235] } // blue-600
            ];

            let xPos = 15;
            const cardWidth = 42; // Increased slightly if needed, or adjust spacing
            const cardGap = 4; // Gap between cards

            summary.forEach((item) => {
                doc.setFillColor(248, 250, 252); // slate-50
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.roundedRect(xPos, yPos, cardWidth, 25, 3, 3, 'FD');

                doc.setFontSize(7); // Smaller font for title
                doc.setTextColor(100, 116, 139);
                doc.text(item.title.toUpperCase(), xPos + (cardWidth / 2), yPos + 8, { align: 'center' });

                doc.setFontSize(9); // Size to fit value
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(item.color[0], item.color[1], item.color[2]);
                doc.text(item.value, xPos + (cardWidth / 2), yPos + 18, { align: 'center' });

                xPos += cardWidth + cardGap;
            });

            // --- Category Table ---
            yPos += 50; // Increased spacing as requested
            doc.setFontSize(12);
            doc.setTextColor(51, 65, 85);
            doc.text("Detalhamento por Categoria", 15, yPos);

            // Clean table data - no concatenation, simpler
            const tableBody = data.breakdown.map(item => [
                item.name,
                item.type === 'IN' ? 'Entrada' : 'Saída',
                Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            ]);

            autoTable(doc, {
                startY: yPos + 5,
                head: [['Categoria', 'Tipo', 'Valor']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: 'left' },
                styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'center' },
                    2: { halign: 'right', fontStyle: 'bold', minCellWidth: 35 }
                },
                didParseCell: (data) => {
                    // Optional styling
                }
            });

            // --- Footer ---
            const pageCount = doc.internal.getNumberOfPages();
            const now = new Date().toLocaleString('pt-BR');
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text(`Relatório gerado por Admin User em ${now}`, 15, 285);
                doc.text(`Página ${i} de ${pageCount}`, 195, 285, { align: 'right' });
            }

            doc.save(`Balancete_${monthsNames[data.month - 1]}_${data.year}.pdf`);
            toast.success('Relatório gerado!', { id: toastId });

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Erro ao gerar PDF', { id: toastId });
        }
    };

    // Get real user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || { id: 0, name: 'Unknown' };

    useEffect(() => {
        fetchclosures();

        const handleTenantChange = () => {
            setLoading(true);
            fetchclosures();
        };
        window.addEventListener('tenantChanged', handleTenantChange);
        return () => window.removeEventListener('tenantChanged', handleTenantChange);
    }, [year]);

    const fetchclosures = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/finance/closure?year=${year}`);
            if (response.ok) {
                const data = await response.json();
                setMonthsData(data);
            }
        } catch (error) {
            console.error('Failed to fetch closures:', error);
            toast.error('Erro ao carregar fechamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseClick = (monthData) => {
        setMonthToClose(monthData);
        setIsCloseModalOpen(true);
    };

    const confirmClose = async () => {
        if (!monthToClose) return;

        try {
            const response = await api.post('/api/finance/closure/close', {
                month: monthToClose.month,
                year,
                userId: user.id
            });

            if (response.ok) {
                toast.success('Mês encerrado com sucesso!');
                setIsCloseModalOpen(false);
                fetchclosures();
            } else {
                const err = await response.json();
                toast.error(err.error || 'Erro ao fechar mês');
            }
        } catch (error) {
            console.error('Error closing month:', error);
            toast.error('Erro de conexão');
        }
    };

    const handleReopenClick = (monthData) => {
        setSelectedMonth(monthData);
        setReopenReason('');
        setIsReopenModalOpen(true);
    };

    const confirmReopen = async () => {
        if (!reopenReason.trim()) {
            toast.error('Justificativa obrigatória');
            return;
        }

        try {
            const response = await api.post('/api/finance/closure/reopen', {
                month: selectedMonth.month,
                year,
                userId: user.id,
                reason: reopenReason
            });

            if (response.ok) {
                toast.success('Mês reaberto com sucesso!');
                setIsReopenModalOpen(false);
                fetchclosures();
            } else {
                toast.error('Erro ao reabrir mês');
            }
        } catch (error) {
            console.error('Error reopening month:', error);
            toast.error('Erro de conexão');
        }
    };

    const monthsNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const isFuture = (m) => {
        const now = new Date();
        const currentM = now.getMonth() + 1;
        const currentY = now.getFullYear();
        if (year > currentY) return true;
        if (year === currentY && m > currentM) return true;
        return false;
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                            <LockIcon className="w-8 h-8 text-blue-600" />
                            Fechamento Mensal
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                            Controle de encerramento de competências e travas de segurança.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => setYear(year - 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xl font-black text-gray-900 dark:text-white px-4">{year}</span>
                        <button
                            onClick={() => setYear(year + 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Months Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        monthsData.map((m) => {
                            const isClosed = m.status === 'CLOSED';
                            const isFutureMonth = isFuture(m.month);

                            return (
                                <div key={m.month} className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isClosed
                                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'
                                    : isFutureMonth
                                        ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-60'
                                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10'
                                    }`}>
                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6">
                                        {isClosed ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                <LockIcon className="w-3 h-3" /> Encerrado
                                            </div>
                                        ) : (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest ${isFutureMonth ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-500/10 border-green-500/20 text-green-500'
                                                }`}>
                                                {isFutureMonth ? 'Futuro' : <><Unlock className="w-3 h-3" /> Aberto</>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${isClosed ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                }`}>
                                                {String(m.month).padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{monthsNames[m.month - 1]}</h3>
                                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{year}</p>
                                            </div>
                                        </div>

                                        {/* Financial Summary */}
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400 font-bold uppercase tracking-wider">Saldo Inicial</span>
                                                <span className="text-gray-600 dark:text-gray-300 font-bold">R$ {m.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400 font-bold uppercase tracking-wider">Entradas</span>
                                                <span className="text-green-500 font-bold">+ R$ {m.totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400 font-bold uppercase tracking-wider">Saídas</span>
                                                <span className="text-red-500 font-bold">- R$ {m.totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="h-px bg-gray-100 dark:bg-slate-800 my-2"></div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-900 dark:text-white font-black uppercase tracking-wider">Saldo Final</span>
                                                <span className={`font-black ${m.finalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                    R$ {m.finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {isClosed ? (
                                                user.role === 'ADMIN' && (
                                                    <div className="flex gap-3 w-full">
                                                        <button
                                                            onClick={() => generatePDF(m)}
                                                            className="h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-900/30"
                                                            title="Baixar Relatório PDF"
                                                        >
                                                            <FileText className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReopenClick(m)}
                                                            className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                                                        >
                                                            <ShieldAlert className="w-4 h-4" />
                                                            Reabrir Mês
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                !isFutureMonth && (
                                                    <button
                                                        onClick={() => handleCloseClick(m)}
                                                        className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900/5 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
                                                    >
                                                        <LockIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                                        Encerrar Mês
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Close Confirmation Modal */}
                {isCloseModalOpen && monthToClose && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCloseModalOpen(false)}></div>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800 p-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <LockIcon className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Encerrar Competência</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    Confirma o encerramento do mês <span className="font-bold text-gray-900 dark:text-white">{String(monthToClose.month).padStart(2, '0')}/{year}</span>? <br />
                                    Esta ação travará todas as edições no período.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setIsCloseModalOpen(false)}
                                    className="h-12 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmClose}
                                    className="h-12 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                >
                                    Confirmar Encerramento
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reopen Modal */}
                {isReopenModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReopenModalOpen(false)}></div>
                        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-slate-800 p-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ShieldAlert className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Reabertura de Mês</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    Esta ação removerá a trava de segurança e permitirá edições no período. Uma justificativa é obrigatória para a auditoria.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Justificativa</label>
                                    <textarea
                                        value={reopenReason}
                                        onChange={(e) => setReopenReason(e.target.value)}
                                        className="w-full h-32 p-4 mt-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500 rounded-2xl resize-none outline-none text-sm font-medium dark:text-white"
                                        placeholder="Ex: Correção de lançamento duplicado..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsReopenModalOpen(false)}
                                        className="h-12 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmReopen}
                                        className="h-12 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20"
                                    >
                                        Confirmar Reabertura
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

export default MonthlyClosure;
