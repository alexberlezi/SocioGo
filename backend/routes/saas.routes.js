const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SETTINGS_KEY = 'SAAS_FEATURES';

// Default Features
const DEFAULT_FEATURES = {
    SITE: true,
    PORTAL_SOCIO: true,
    PORTAL_FINANCEIRO: true,
    PORTAL_VOTACOES: true,
    COMUNICACAO: true,
    ACESSOS: true,
    FINANCEIRO_ADM: true,
    EVENTOS: true,
    AUDITORIA: true,
    COMUNICACAO_ZAP: false
};

// GET /api/saas/features
router.get('/features', async (req, res) => {
    try {
        const { companyId } = req.query;

        // 1. Tenant Specific Features
        if (companyId) {
            const company = await prisma.association.findUnique({
                where: { id: parseInt(companyId) }
            });

            if (!company) {
                return res.status(404).json({ error: 'Associação não encontrada' });
            }

            // Return custom modules or fallback to defaults
            const features = company.activeModules || DEFAULT_FEATURES;
            return res.json(features);
        }

        // 2. Global Default Features (Settings for the landing page or new tenants)
        let settings = await prisma.systemSettings.findUnique({
            where: { key: SETTINGS_KEY }
        });

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    key: SETTINGS_KEY,
                    value: DEFAULT_FEATURES
                }
            });
        }

        res.json(settings.value);
    } catch (error) {
        console.error('Error fetching features:', error);
        res.status(500).json({ error: 'Erro ao carregar funcionalidades' });
    }
});

// PUT /api/saas/features - Global Admin Only
router.put('/features', async (req, res) => {
    try {
        const { userId, features, companyId } = req.body;
        console.log('PUT /features payload:', { userId, companyId, features });

        if (!userId) {
            return res.status(400).json({ error: 'Usuário não identificado' });
        }

        // 1. Bypass check for Hardcoded Super Admin UUID (Frontend Legacy/Config)
        const SUPER_ADMIN_UUID = '875b818e-aa0d-40af-885a-f00202bbd03c';
        if (userId === SUPER_ADMIN_UUID) {
            // Allow proceed if it matches the master key
            // Proceed to update logic
        } else {
            // 2. Normal DB Check
            const numericId = parseInt(userId);
            if (isNaN(numericId)) {
                return res.status(403).json({ error: 'ID de usuário inválido' });
            }

            const user = await prisma.user.findUnique({
                where: { id: numericId }
            });

            const isGlobalAdmin = user && (
                user.role === 'GLOBAL_ADMIN' ||
                user.role === 'ADMIN' ||
                user.role === 'Admin Global' ||
                String(user.id) === '1'
            );

            if (!isGlobalAdmin) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }

        // 1. Update Tenant Features
        if (companyId) {
            await prisma.association.update({
                where: { id: parseInt(companyId) },
                data: { activeModules: features }
            });
            return res.json(features);
        }

        // 2. Update Global Defaults
        const updated = await prisma.systemSettings.update({
            where: { key: SETTINGS_KEY },
            data: { value: features }
        });

        res.json(updated.value);
    } catch (error) {
        console.error('Error updating features:', error);
        res.status(500).json({ error: 'Erro ao atualizar funcionalidades' });
    }
});

// GET /api/saas/check-permissions - Quick permission check for FeatureGuard
// Returns: { allowed: bool, features: {...} }
router.get('/check-permissions', async (req, res) => {
    try {
        const { companyId, feature } = req.query;

        if (!companyId) {
            // No tenant ID = assume global defaults (allowed for global admins)
            return res.json({ allowed: true });
        }

        const company = await prisma.association.findUnique({
            where: { id: parseInt(companyId) }
        });

        if (!company) {
            return res.status(404).json({ allowed: false, error: 'Associação não encontrada' });
        }

        // Check if company is active
        if (company.status !== 'ACTIVE') {
            return res.status(403).json({ allowed: false, error: 'Associação inativa' });
        }

        const features = company.activeModules || DEFAULT_FEATURES;

        // If specific feature requested, check it
        if (feature) {
            const allowed = features[feature] === true;
            return res.json({ allowed, features });
        }

        res.json({ allowed: true, features });
    } catch (error) {
        console.error('Check permissions error:', error);
        res.status(500).json({ allowed: false, error: 'Erro interno' });
    }
});

module.exports = router;
