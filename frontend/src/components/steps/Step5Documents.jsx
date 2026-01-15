import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const FileInput = ({ label, name, required = false }) => {
    const { register, watch, formState: { errors } } = useFormContext();
    const fileList = watch(name);
    const hasFile = fileList && fileList.length > 0;
    const error = errors[name];

    return (
        <div className="space-y-2 group">
            <label className="flex justify-between items-center text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600">
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
                {hasFile && (
                    <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" /> Anexado
                    </span>
                )}
            </label>

            <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-out text-center group-hover:scale-[1.01] ${hasFile
                ? 'border-green-400 bg-green-50/30'
                : error
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5'
                }`}>
                <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    {...register(name)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    {hasFile ? (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                        </div>
                    ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${error ? 'bg-red-100' : 'bg-gray-50 group-hover:bg-blue-100'}`}>
                            {error ? <AlertCircle className="w-6 h-6 text-red-500" /> : <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />}
                        </div>
                    )}

                    <div className="text-sm">
                        {hasFile ? (
                            <span className="font-semibold text-gray-900 line-clamp-1 px-4">{fileList[0].name}</span>
                        ) : (
                            <div className="space-y-1">
                                <p className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                    Clique para upload
                                </p>
                                <p className="text-xs text-gray-400">PDF, JPG ou PNG</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
        </div>
    );
};

const Step5Documents = () => {
    const { watch } = useFormContext();
    const type = watch('type');

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Documentos</h2>
                <p className="text-gray-500 text-sm">Envie as cópias digitais dos documentos solicitados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {type === 'PF' ? (
                    <>
                        <FileInput label="RG ou CNH (Frente e Verso)" name="docRgCnh" />
                        <FileInput label="CPF" name="docCpf" />
                        <FileInput label="Diploma" name="docDiploma" />
                        <FileInput label="Registro Profissional" name="docProfessionalRegistry" />
                        <FileInput label="Foto do Sócio (Perfil)" name="docPartnerPhoto" />
                    </>
                ) : (
                    <>
                        <FileInput label="Contrato Social" name="docSocialContract" />
                        <FileInput label="Cartão CNPJ" name="docCnpjCard" />
                        <FileInput label="RG do Responsável Legal" name="docResponsibleRg" />
                    </>
                )}
            </div>
        </div>
    );
};

export default Step5Documents;
