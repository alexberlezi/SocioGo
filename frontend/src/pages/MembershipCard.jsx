import React from 'react';
import { useParams } from 'react-router-dom';

const MembershipCard = () => {
    const { id } = useParams();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-xl font-bold">Carteira Digital</h1>
                    <p className="text-blue-100 text-sm">SocioGo</p>
                </div>
                <div className="p-8 text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">📷</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Membro #{id || 'Demo'}</h2>
                    <p className="text-green-600 font-bold mb-4">● Ativo</p>
                    <div className="text-left text-sm space-y-2 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <p><span className="font-bold">CPF:</span> ***.***.***-**</p>
                        <p><span className="font-bold">Validade:</span> 12/2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipCard;
