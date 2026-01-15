import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FileText, ShieldCheck, Check } from 'lucide-react';

const SummaryItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className="text-sm text-gray-900 sm:text-right font-bold">{value}</span>
        </div>
    );
};

const Step6Review = () => {
    const { getValues, register, formState: { errors } } = useFormContext();
    const values = getValues();
    const dependentsCount = values.dependents?.length || 0;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Revisão</h2>
                <p className="text-gray-500 text-sm">Confira seus dados antes de finalizar.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Resumo dos Dados</h3>
                </div>

                <div className="p-6 space-y-1">
                    <SummaryItem label="Tipo de Cadastro" value={values.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} />
                    <SummaryItem label="E-mail" value={values.email} />

                    {values.type === 'PF' ? (
                        <>
                            <SummaryItem label="Nome" value={values.fullName} />
                            <SummaryItem label="CPF" value={values.cpf} />
                            <SummaryItem label="Telefone" value={values.phone} />
                            <SummaryItem label="Empresa Atual" value={values.currentCompany} />
                        </>
                    ) : (
                        <>
                            <SummaryItem label="Razão Social" value={values.socialReason} />
                            <SummaryItem label="CNPJ" value={values.cnpj} />
                            <SummaryItem label="Responsável" value={values.responsibleName} />
                        </>
                    )}

                    <div className="pt-4 mt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block px-2">Localização</span>
                        <SummaryItem label="Endereço" value={`${values.street}, ${values.number}`} />
                        <SummaryItem label="Cidade/UF" value={`${values.city} / ${values.state}`} />
                    </div>

                    {values.type === 'PF' && dependentsCount > 0 && (
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block px-2">Dependentes</span>
                            <div className="px-2 py-2 bg-blue-50/50 rounded-lg border border-blue-50 text-blue-800 text-sm font-medium">
                                {dependentsCount} dependente(s) adicionado(s) ao plano.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <label className={`group relative flex items-start space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${errors.termsAccepted ? 'border-red-200 bg-red-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 bg-white shadow-sm'}`}>
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('termsAccepted')}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                        />
                        <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">
                        Li e aceito os <a href="#" className="text-blue-600 font-bold hover:text-blue-800 underline decoration-2 underline-offset-2">Termos de Uso</a> e o Estatuto da Associação.
                        {errors.termsAccepted && <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors.termsAccepted.message}</p>}
                    </span>
                </label>

                <label className={`group relative flex items-start space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${errors.lgpdAccepted ? 'border-red-200 bg-red-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 bg-white shadow-sm'}`}>
                    <div className="relative flex items-center mt-1">
                        <input
                            type="checkbox"
                            {...register('lgpdAccepted')}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                        />
                        <Check className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-gray-800 text-sm">Privacidade de Dados</span>
                        </div>
                        <span className="text-sm text-gray-500 leading-relaxed block">
                            Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD) para fins de cadastro associativo.
                            {errors.lgpdAccepted && <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors.lgpdAccepted.message}</p>}
                        </span>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default Step6Review;
