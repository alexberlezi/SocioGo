/**
 * API Helper with Tenant Context
 * 
 * This module provides a fetch wrapper that automatically includes the
 * x-tenant-id header for tenant-scoped requests.
 */

const API_BASE = 'http://localhost:3000';

/**
 * Get the current tenant ID from localStorage
 */
export const getActiveTenantId = () => {
    const tenantId = localStorage.getItem('activeTenantId');
    if (tenantId && tenantId !== 'null') {
        return tenantId;
    }
    return null;
};

/**
 * Build headers including tenant context
 */
export const buildHeaders = (customHeaders = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...customHeaders
    };

    const tenantId = getActiveTenantId();
    if (tenantId) {
        headers['x-tenant-id'] = tenantId;
    }

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Tenant-aware fetch wrapper
 * Automatically includes x-tenant-id header and handles common patterns
 */
export const tenantFetch = async (url, options = {}) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

    const headers = buildHeaders(options.headers);

    const response = await fetch(fullUrl, {
        ...options,
        headers
    });

    return response;
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
    get: (url, options = {}) => tenantFetch(url, { ...options, method: 'GET' }),

    post: (url, data, options = {}) => tenantFetch(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    }),

    put: (url, data, options = {}) => tenantFetch(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    patch: (url, data, options = {}) => tenantFetch(url, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(data)
    }),

    delete: (url, options = {}) => tenantFetch(url, { ...options, method: 'DELETE' })
};

export default api;
