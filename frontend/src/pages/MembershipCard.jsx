import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { RotateCw, CheckCircle } from 'lucide-react';

const MembershipCard = ({ memberData }) => {
    const { id } = useParams();
    const [isFlipped, setIsFlipped] = useState(false);

    // Default Mock Data (Fallback)
    const defaultMember = {
        id: id || '0000',
        name: "Alexandre Silva",
        role: "Engenheiro de Software",
        admissionDate: "15/03/2023",
        validThru: "12/2025",
        status: "ACTIVE",
        photo: "https://i.pravatar.cc/300?u=alex",
        cpf: "123.***.***-99"
    };

    // Use prop data if available, otherwise use default
    const member = memberData || defaultMember;

    const isSuspended = member.status === 'SUSPENDED';

    return (
        <div className="flex flex-col items-center justify-center p-4 w-full h-full">
            {/* Context Header (only if not in modal implies cleaner look, but user wants titles) */}
            <div className="mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sua Identidade</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Toque no cartão para ver o QR Code</p>
            </div>

            <div
                className="relative w-[90%] md:w-[420px] aspect-[1.586/1] cursor-pointer group perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`relative w-full h-full transition-all duration-700 transform-style-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>

                    {/* FRONT SIDE */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden bg-slate-900 text-white border border-slate-700/50 shadow-2xl">
                        {/* Vibrant Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        {/* Texture causing subtle noise/grain if needed, skipping for cleaner look */}

                        {/* Status Overlay */}
                        {isSuspended && (
                            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center flex-col rounded-2xl">
                                <div className="border-[3px] border-white px-8 py-2 -rotate-12 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.7)]">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-widest text-white uppercase drop-shadow-md">Inválida</h1>
                                </div>
                                <p className="mt-4 font-bold text-white text-lg drop-shadow-md">Regularize sua situação</p>
                            </div>
                        )}

                        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                            {/* Header: Logo & ID */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg text-white border border-white/10">
                                        SG
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg leading-none tracking-tight text-white">SocioGo</h3>
                                        <p className="text-[9px] text-blue-200 uppercase tracking-[0.2em] mt-1 font-semibold">Identidade Digital</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Matrícula</p>
                                    <p className="font-mono font-bold text-lg text-blue-400 leading-none">#{member.id.padStart(6, '0')}</p>
                                </div>
                            </div>

                            {/* Center Content: Photo & Info */}
                            <div className="flex items-end gap-5 mt-2">
                                <div className="relative group-hover:scale-[1.02] transition-transform duration-300">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-50 blur-sm"></div>
                                    <img
                                        src={member.photo}
                                        alt="Profile"
                                        className="relative w-24 h-32 md:w-28 md:h-36 object-cover rounded-xl border-[3px] border-white shadow-xl bg-slate-800"
                                    />
                                    {!isSuspended && (
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-[3px] border-slate-900 flex items-center justify-center shadow-sm z-20">
                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight truncate drop-shadow-sm">
                                        {member.name}
                                    </h2>
                                    <p className="text-blue-200 text-sm font-semibold truncate mt-1 mb-3 bg-blue-900/30 inline-block px-2 py-0.5 rounded-lg border border-blue-500/20">
                                        {member.role}
                                    </p>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">CPF</p>
                                            <p className="text-xs font-mono font-medium text-slate-200">{member.cpf}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Validade</p>
                                            <p className="text-xs font-mono font-bold text-green-400">{member.validThru}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-white text-slate-900 border border-slate-200 shadow-2xl">
                        {/* Background Pattern Back */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

                        {isSuspended && (
                            <div className="absolute inset-0 z-50 bg-red-900/90 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                <span className="font-black text-white text-2xl uppercase tracking-widest border-4 border-white p-4 -rotate-12">Bloqueado</span>
                            </div>
                        )}

                        <div className="p-6 h-full flex flex-col items-center justify-between text-center relative z-10">
                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 mb-6 w-fit mx-auto">
                                    <QRCode
                                        value={`https://sociogo.app/verify/${member.id}`}
                                        size={140}
                                        fgColor={isSuspended ? "#ef4444" : "#020617"} // Slate-950
                                    />
                                </div>

                                <h3 className="font-bold text-lg leading-tight text-slate-900">{member.name}</h3>
                                <p className="text-sm text-slate-500 font-mono">{member.cpf}</p>
                            </div>

                            <div className="w-full border-t-2 border-slate-100 pt-4 mt-2">
                                <p className="text-xs font-bold text-blue-600 mb-1.5 uppercase tracking-wide">
                                    Aponte a câmera para validar
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight mx-auto max-w-[85%]">
                                    Documento pessoal, intransferível e válido apenas mediante regularidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-blue-300 font-bold rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all active:scale-95"
            >
                <RotateCw className="w-4 h-4" />
                <span>Virar Cartão</span>
            </button>
        </div>
    );
};

export default MembershipCard;
