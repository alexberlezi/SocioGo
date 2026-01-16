import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, User, Clock } from 'lucide-react';

const PublicValidator = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const [member, setMember] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/public/validate/${id}`);
                if (!response.ok) {
                    throw new Error('Sócio não encontrado');
                }
                const data = await response.json();

                // Fallback for Alex Berlezi as requested if photo is missing
                if (data.name.includes('Alex Berlezi') && !data.photo) {
                    data.photo = 'https://github.com/alexberlezi.png';
                }

                setMember(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMember();
        }
    }, [id]);



    // Status Map Configuration
    const statusConfig = {
        'APPROVED': {
            color: 'green',
            borderColor: 'border-green-500',
            glowColor: 'shadow-green-500/50',
            bgColor: 'bg-green-500',
            textColor: 'text-green-400',
            icon: CheckCircle,
            label: 'Sócio em situação REGULAR',
            badgeTitle: 'Documento Validado Digitalmente',
            badgeIcon: ShieldCheck,
            badgeColor: 'emerald'
        },
        'PENDING': {
            color: 'yellow',
            borderColor: 'border-yellow-500',
            glowColor: 'shadow-yellow-500/50',
            bgColor: 'bg-yellow-500',
            textColor: 'text-yellow-400',
            icon: Clock, // Clock for pending
            label: 'Aprovação PENDENTE',
            badgeTitle: 'Aguardando Aprovação',
            badgeIcon: AlertCircle,
            badgeColor: 'yellow'
        },
        'SUSPENDED': {
            color: 'red',
            borderColor: 'border-red-500',
            glowColor: 'shadow-red-500/50',
            bgColor: 'bg-red-500',
            textColor: 'text-red-400',
            icon: AlertCircle,
            label: 'Matrícula SUSPENSA',
            badgeTitle: 'Documento Inválido',
            badgeIcon: AlertCircle,
            badgeColor: 'red'
        },
        'default': {
            color: 'red',
            borderColor: 'border-red-500',
            glowColor: 'shadow-red-500/50',
            bgColor: 'bg-red-500',
            textColor: 'text-red-400',
            icon: AlertCircle,
            label: 'Situação IRREGULAR',
            badgeTitle: 'Documento Inválido',
            badgeIcon: AlertCircle,
            badgeColor: 'red'
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-mono text-sm animate-pulse">Verificando dados...</p>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-500/30">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Erro na Validação</h2>
                <p className="text-slate-400 mb-6 max-w-xs mx-auto">{error || 'Não foi possível localizar o documento informado.'}</p>
                <Link
                    to="/"
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors font-medium border border-slate-700"
                >
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    // Validation Logic - Safe to run now
    const isValid = member.status === 'APPROVED';
    const config = statusConfig[member.status] || statusConfig['default'];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-${config.color}-600/10 rounded-full blur-[100px] pointer-events-none`}></div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center relative z-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">

                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        SocioGo
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Validador Oficial</p>
                </div>

                {/* Photo with dynamic border */}
                <div className="relative mb-6 group">
                    <div className={`absolute -inset-1 rounded-full blur opacity-75 animate-pulse ${config.bgColor}`}></div>

                    <img
                        src={`${member.photo}?v=3`}
                        alt={member.name}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                        className={`relative w-40 h-40 object-cover rounded-full border-[4px] ${config.borderColor} shadow-xl ${config.glowColor} bg-slate-800`}
                    />

                    {/* Fallback Icon */}
                    <div className="hidden absolute top-0 left-0 w-40 h-40 rounded-full border-[4px] border-inherit shadow-xl bg-slate-800 items-center justify-center pointer-events-none">
                        <User className="w-20 h-20 text-slate-400" />
                    </div>

                    {/* Status Icon Badge */}
                    <div className={`absolute bottom-1 right-1 w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center border-[4px] border-slate-900 text-white shadow-lg z-20`}>
                        <config.icon className="w-5 h-5" />
                    </div>
                </div>

                {/* Member Details */}
                <h2 className="text-2xl font-black text-white mb-2">{member.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                        MATRÍCULA #{member.id}
                    </span>
                </div>

                <p className="text-blue-200 text-sm font-semibold mb-8 bg-blue-900/20 px-4 py-1.5 rounded-lg border border-blue-500/20">
                    {member.role}
                </p>

                {/* Dynamic Validation Badge */}
                <div className={`w-full bg-${config.badgeColor}-950/30 border border-${config.badgeColor}-900/50 rounded-xl p-4 mb-8 flex items-center gap-4 text-left`}>
                    <div className={`w-12 h-12 bg-${config.badgeColor}-900/50 rounded-lg flex items-center justify-center shrink-0`}>
                        <config.badgeIcon className={`w-6 h-6 text-${config.badgeColor}-400`} />
                    </div>
                    <div>
                        <p className={`text-${config.badgeColor}-400 font-bold text-xs uppercase tracking-wide`}>{config.badgeTitle}</p>
                        <p className={`text-${config.badgeColor}-600/80 text-[10px] font-mono mt-0.5 leading-tight`}>
                            {isValid ? (
                                new Date().toLocaleString('pt-BR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })
                            ) : (
                                "Regularize seu cadastro para validar."
                            )}
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`bg-${config.color}-500/10 ${config.textColor} px-6 py-3 rounded-xl text-sm font-bold border border-${config.color}-500/20 w-full mb-8 flex items-center justify-center gap-2`}>
                    {!isValid && <AlertCircle className="w-4 h-4" />}
                    {config.label}
                </div>

                {/* Back Button */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Início
                </Link>

            </div>

            {/* Footer */}
            <p className="mt-8 text-slate-600 text-xs text-center max-w-xs">
                A validade deste documento digital está condicionada à verificação online em tempo real.
            </p>
        </div>
    );
};

export default PublicValidator;
