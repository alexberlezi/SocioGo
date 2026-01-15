import React, { useState } from 'react';
import {
    User, MapPin, Briefcase, Users, FileText, CheckCircle, XCircle,
    Mail, MessageCircle, Download, Calendar, Phone, Globe, Building
} from 'lucide-react';
import Card from './ui/Card';

// Reusable Section Component
const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 last:mb-0">
        <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-100">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-base font-bold text-gray-900">{title}</h4>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children}
        </div>
    </div>
);

const DataField = ({ label, value, fullWidth }) => (
    <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
        <span className="text-xs font-bold text-gray-600 mb-1.5 ml-1">{label}</span>
        <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium shadow-sm">
            {value || <span className="text-gray-400 italic">Não informado</span>}
        </div>
    </div>
);


const TabButton = ({ active, onClick, label, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
    >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
    </button>
);

const MemberApprovalCard = ({ member, onApprove, onReject }) => {
    const [activeTab, setActiveTab] = useState('data'); // 'data' or 'docs'
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const { profile, dependents } = member;
    if (!profile) return null;

    // Helper to format dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fadeIn">

            {/* --- LEFT COLUMN: PROFILE SUMMARY (STICKY) --- */}
            <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                    {/* Blue Header Background */}
                    <div className="h-32 w-full bg-blue-600 absolute top-0 left-0 z-0"></div>

                    {/* Profile Picture */}
                    <div className="relative z-10 mt-8 mb-3">
                        <div className="w-36 h-36 rounded-2xl bg-white p-1.5 shadow-xl mx-auto transform rotate-0 hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                                {profile.docPartnerPhoto ? (
                                    <img
                                        src={`http://localhost:3000/${profile.docPartnerPhoto}`}
                                        alt={profile.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-black text-gray-300">
                                        {profile.fullName ? profile.fullName.charAt(0) : 'U'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Status */}
                    <div className="px-6 pb-6 w-full flex flex-col items-center z-10">
                        <h2 className="text-lg font-black text-gray-900 mb-1 leading-snug uppercase tracking-tight text-center">
                            {profile.type === 'PF' ? profile.fullName : profile.socialReason}
                        </h2>

                        <span className="inline-flex items-center px-4 py-1.5 bg-yellow-50 text-yellow-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3 border border-yellow-100">
                            Pendente
                        </span>

                        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-semibold mb-6 w-full">
                            <Briefcase className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{profile.type === 'PF' ? (profile.jobRole || 'Não informado') : 'Empresa'}</span>
                        </div>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

                        {/* Quick Actions Title */}
                        <div className="w-full text-left mb-3">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Ações Rápidas</span>
                        </div>

                        {/* Quick Actions Buttons */}
                        <div className="w-full flex gap-3 mb-6">
                            <a href={`mailto:${member.email}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 transition-all hover:bg-blue-100 hover:shadow-sm">
                                <Mail className="w-4 h-4" />
                                <span className="text-xs font-bold">Email</span>
                            </a>
                            {profile.phone && (
                                <a href={`https://wa.me/55${profile.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100/50 transition-all hover:bg-green-100 hover:shadow-sm">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold">WhatsApp</span>
                                </a>
                            )}
                        </div>

                        {/* Approval Actions */}
                        <div className="mt-auto w-full space-y-3">
                            {showRejectInput ? (
                                <div className="animate-fade-in-up w-full text-left bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-600 mb-2 block">Justificativa:</label>
                                    <textarea
                                        placeholder="Motivo da recusa..."
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none mb-3 min-h-[80px] resize-none"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onReject(member.id, rejectReason)}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            onClick={() => setShowRejectInput(false)}
                                            className="flex-1 bg-white text-gray-600 border border-gray-200 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onApprove(member.id)}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl hover:shadow-green-200 transition-all transform hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Aprovar Cadastro</span>
                                    </button>
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-500 font-bold hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span>Recusar</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: CONTENT CARDS --- */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* Tabs Navigation Card - Full Width Blue Pill */}
                <div className="bg-white p-1 rounded-xl border border-gray-200 flex w-full gap-1">
                    <TabButton
                        active={activeTab === 'data'}
                        onClick={() => setActiveTab('data')}
                        label="Dados Cadastrais"
                        icon={User}
                    />
                    <TabButton
                        active={activeTab === 'docs'}
                        onClick={() => setActiveTab('docs')}
                        label="Documentos Anexados"
                        icon={FileText}
                    />
                </div>

                {/* Content Area */}
                <div className="animate-fadeIn pb-10">
                    {activeTab === 'data' ? (
                        <div className="space-y-6">
                            {/* Personal Data */}
                            <SectionCard title="Dados Pessoais" subtitle="Informações básicas de identificação" icon={User}>
                                <DataField label="Nome Completo / Razão Social" value={profile.type === 'PF' ? profile.fullName : profile.socialReason} fullWidth />
                                <DataField label={profile.type === 'PF' ? 'CPF' : 'CNPJ'} value={profile.type === 'PF' ? profile.cpf : profile.cnpj} />
                                <DataField label="E-mail" value={member.email} />
                                <DataField label="Telefone" value={profile.phone} />
                                {profile.type === 'PF' && <DataField label="Data de Nascimento" value={formatDate(profile.birthDate)} />}
                                {profile.type === 'PJ' && (
                                    <>
                                        <DataField label="Nome Fantasia" value={profile.fantasyName} />
                                        <DataField label="Inscrição Estadual" value={profile.stateRegistration} />
                                        <DataField label="Responsável" value={profile.responsibleName} />
                                        <DataField label="CPF Responsável" value={profile.responsibleCpf} />
                                    </>
                                )}
                            </SectionCard>

                            {/* Address */}
                            <SectionCard title="Endereço" subtitle="Localização e correspondência" icon={MapPin}>
                                <DataField label="CEP" value={profile.zipCode} />
                                <DataField label="Rua" value={profile.street} />
                                <DataField label="Número" value={profile.number} />
                                <DataField label="Complemento" value={profile.complement} />
                                <DataField label="Bairro" value={profile.district} />
                                <DataField label="Cidade" value={profile.city} />
                                <DataField label="Estado" value={profile.state} />
                            </SectionCard>

                            {/* Professional */}
                            <SectionCard title={profile.type === 'PF' ? 'Dados Profissionais' : 'Dados Corporativos'} subtitle="Informações de atuação e registros" icon={Briefcase}>
                                {profile.type === 'PF' ? (
                                    <>
                                        <DataField label="Profissão" value={profile.jobRole} />
                                        <DataField label="Empresa Atual" value={profile.currentCompany} />
                                        <DataField label="Formação" value={profile.education} />
                                        <DataField label="Registro Profissional" value={profile.professionalRegistry} />
                                    </>
                                ) : (
                                    <>
                                        <DataField label="Ramo de Atividade" value={profile.activityBranch} />
                                        <DataField label="Website" value={profile.website} fullWidth />
                                        <DataField label="Nº Funcionários" value={profile.employeeCount} />
                                    </>
                                )}
                            </SectionCard>

                            {/* Dependents (PF Only) */}
                            {profile.type === 'PF' && (
                                <SectionCard title="Dependentes" subtitle="Familiares cadastrados" icon={Users}>
                                    {dependents && dependents.length > 0 ? (
                                        <div className="col-span-full space-y-3">
                                            {dependents.map((dep, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div>
                                                        <span className="font-bold text-gray-800">{dep.name}</span>
                                                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{dep.kinship}</span>
                                                            <span>Nasc: {formatDate(dep.birthDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic col-span-full">Nenhum dependente cadastrado.</span>
                                    )}
                                </SectionCard>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Documents Tab - keep as grid */}
                            {[
                                { label: 'RG/CNH', path: profile.docRgCnh },
                                { label: 'CPF', path: profile.docCpf },
                                { label: 'Diploma', path: profile.docDiploma },
                                { label: 'Registro Profissional', path: profile.docProfessionalRegistry },
                                { label: 'Foto do Sócio', path: profile.docPartnerPhoto },
                                { label: 'Contrato Social', path: profile.docSocialContract },
                                { label: 'Cartão CNPJ', path: profile.docCnpjCard },
                                { label: 'RG do Responsável', path: profile.docResponsibleRg },
                            ].filter(d => d.path).map((doc, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-red-50 rounded-lg text-red-500">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{doc.label}</h4>
                                            <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`http://localhost:3000/${doc.path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                </div>
                            ))}

                            {[
                                { label: 'RG/CNH', path: profile.docRgCnh },
                                { label: 'CPF', path: profile.docCpf },
                                { label: 'Diploma', path: profile.docDiploma },
                                { label: 'Foto', path: profile.docPartnerPhoto }
                            ].filter(d => d.path).length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhum documento encontrado.</p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Icon for Docs
const ExternalLink = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);

export default MemberApprovalCard;
