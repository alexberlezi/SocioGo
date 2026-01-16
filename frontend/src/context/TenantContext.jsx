import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const TenantContext = createContext({
    activeTenantId: null,
    activeTenant: null,
    tenants: [],
    setActiveTenantId: () => { },
    isGlobalView: true,
    refreshTenants: () => { }
});

export const TenantProvider = ({ children }) => {
    const [activeTenantId, setActiveTenantIdState] = useState(null);
    const [activeTenant, setActiveTenant] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userReady, setUserReady] = useState(false);

    // Read user from localStorage reactively
    const user = useMemo(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    }, [userReady]);

    const isGlobalAdmin = useMemo(() => {
        const result = user?.role === 'GLOBAL_ADMIN' ||
            user?.role === 'Admin Global' ||
            String(user?.id) === '1' ||
            user?.id === '875b818e-aa0d-40af-885a-f00202bbd03c';
        console.log('[TenantContext] User:', user, 'isGlobalAdmin:', result);
        return result;
    }, [user]);

    // Force re-read of user when component mounts
    useEffect(() => {
        const timer = setTimeout(() => setUserReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch all associations
    const fetchTenants = useCallback(async () => {
        if (!isGlobalAdmin) {
            console.log('[TenantContext] Not global admin, skipping tenant fetch');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/companies');
            if (res.ok) {
                const data = await res.json();
                setTenants(data);

                // Restore from localStorage if available
                const savedTenantId = localStorage.getItem('activeTenantId');
                if (savedTenantId && savedTenantId !== 'null') {
                    const tenantId = parseInt(savedTenantId);
                    setActiveTenantIdState(tenantId);
                    const found = data.find(t => t.id === tenantId);
                    setActiveTenant(found || null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        } finally {
            setLoading(false);
        }
    }, [isGlobalAdmin]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const setActiveTenantId = useCallback((id) => {
        setActiveTenantIdState(id);

        if (id === null) {
            setActiveTenant(null);
            localStorage.removeItem('activeTenantId');
        } else {
            localStorage.setItem('activeTenantId', id.toString());
            const found = tenants.find(t => t.id === id);
            setActiveTenant(found || null);
        }

        // Trigger a page-wide refetch by dispatching a custom event
        window.dispatchEvent(new CustomEvent('tenantChanged', { detail: { tenantId: id } }));
    }, [tenants]);

    // Is viewing all tenants (global view)
    const isGlobalView = activeTenantId === null;

    return (
        <TenantContext.Provider value={{
            activeTenantId,
            activeTenant,
            tenants,
            setActiveTenantId,
            isGlobalView,
            isGlobalAdmin,
            loading,
            refreshTenants: fetchTenants
        }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    return useContext(TenantContext);
};

// Helper to get tenant header for API calls
export const getTenantHeader = () => {
    const tenantId = localStorage.getItem('activeTenantId');
    if (tenantId && tenantId !== 'null') {
        return { 'x-tenant-id': tenantId };
    }
    return {};
};

// API wrapper that includes tenant header
export const tenantFetch = async (url, options = {}) => {
    const headers = {
        ...options.headers,
        ...getTenantHeader()
    };

    return fetch(url, { ...options, headers });
};

export default TenantContext;
