import React from 'react';

const GlobalAdminGuard = ({ children }) => {
    // Basic Permission Logic - mirroring Sidebar.jsx for consistency
    const user = JSON.parse(localStorage.getItem('user'));

    // Debug
    console.log('[GlobalAdminGuard] Checking Access for:', user);

    // Permissive Check: Allow 'Admin', 'admin', 'Administrator', 'Global Admin', etc. OR User ID 1 OR Specific UUID
    const canAccess = user?.role?.toLowerCase().includes('admin') ||
        String(user?.id) === '1' ||
        user?.id === '875b818e-aa0d-40af-885a-f00202bbd03c';

    if (!canAccess) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white flex-col gap-4">
                <h1 className="text-3xl font-black">Acesso Negado</h1>
                <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
                <button
                    onClick={() => window.location.href = '/admin'}
                    className="text-blue-400 hover:text-blue-300 font-bold"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    return children;
};

export default GlobalAdminGuard;
