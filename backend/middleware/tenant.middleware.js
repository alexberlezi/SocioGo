/**
 * Tenant Context Middleware
 * 
 * Extracts x-tenant-id header and adds tenantId to request object.
 * All routes can then use req.tenantId for tenant-scoped queries.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default/Matrix association ID (fallback when no tenant specified)
const DEFAULT_ASSOCIATION_ID = 1;

const tenantMiddleware = async (req, res, next) => {
    try {
        const tenantIdHeader = req.headers['x-tenant-id'];

        if (tenantIdHeader) {
            const tenantId = parseInt(tenantIdHeader, 10);

            if (!isNaN(tenantId)) {
                // Verify the association exists
                const association = await prisma.association.findUnique({
                    where: { id: tenantId },
                    select: { id: true, name: true, status: true, primaryColor: true }
                });

                if (association && association.status === 'ACTIVE') {
                    req.tenantId = association.id;
                    req.tenant = association;
                    console.log(`[TenantMiddleware] Request scoped to: ${association.name} (ID: ${tenantId})`);
                } else {
                    // Invalid tenant - use default
                    console.warn(`[TenantMiddleware] Invalid or inactive tenant ID: ${tenantId}, using default`);
                    req.tenantId = null; // Global view for admins
                    req.tenant = null;
                }
            } else {
                req.tenantId = null;
                req.tenant = null;
            }
        } else {
            // No tenant header - could be global admin viewing all, or use default
            req.tenantId = null;
            req.tenant = null;
        }

        next();
    } catch (error) {
        console.error('[TenantMiddleware] Error:', error);
        // Don't block the request, just proceed without tenant scope
        req.tenantId = null;
        req.tenant = null;
        next();
    }
};

/**
 * Helper to build tenant filter for Prisma queries
 * Usage: where: { ...buildTenantFilter(req), ...otherFilters }
 */
const buildTenantFilter = (req) => {
    if (req.tenantId) {
        return { associationId: req.tenantId };
    }
    return {}; // No filter - show all (for global admin)
};

/**
 * Helper to require a tenant (returns error if not specified)
 */
const requireTenant = (req, res) => {
    if (!req.tenantId) {
        res.status(400).json({ error: 'Tenant ID is required for this operation' });
        return false;
    }
    return true;
};

module.exports = {
    tenantMiddleware,
    buildTenantFilter,
    requireTenant,
    DEFAULT_ASSOCIATION_ID
};
