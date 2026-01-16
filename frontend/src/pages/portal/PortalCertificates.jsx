import React from 'react';
import { FileText, Download, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PortalCertificates = () => {
    const certificates = [
        { id: 1, title: 'Certificado de Associação', date: '15/03/2023', type: 'OFICIAL' },
        { id: 2, title: 'Participação: Workshop LGPD', date: '10/08/2024', type: 'EVENTO' },
    ];

    const handleDownload = (certTitle) => {
        toast.success(`Baixando ${certTitle}...`);
        // PDF logic here
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Meus Documentos</h1>
                <p className="text-slate-500 text-sm">Certificados e comprovantes emitidos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl text-yellow-600 dark:text-yellow-400">
                                <Award className="w-8 h-8" />
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full uppercase">
                                {cert.type}
                            </span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{cert.title}</h3>
                        <p className="text-xs text-slate-500 mb-6">Emitido em: {cert.date}</p>

                        <button
                            onClick={() => handleDownload(cert.title)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <Download className="w-4 h-4" />
                            Baixar PDF
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortalCertificates;
