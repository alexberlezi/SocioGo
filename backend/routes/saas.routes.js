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
    FINANCEIRO_ADM: true,
    AUDITORIA: true,
    COMUNICACAO_ZAP: false
};

// GET /api/saas/features
router.get('/features', async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { key: SETTINGS_KEY }
        });

        if (!settings) {
            // Create default if not exists
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
        const { userId, features } = req.body;

        // Basic permission check (Should start using middleware really)
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Extended Check: Support 'GLOBAL_ADMIN', 'ADMIN', 'Admin Global' or specific UUID (Super Admin)
        const isGlobalAdmin = user && (
            user.role === 'GLOBAL_ADMIN' ||
            user.role === 'ADMIN' ||
            user.role === 'Admin Global' ||
            String(user.id) === '1' ||
            String(user.id) === '875b818e-aa0d-40af-885a-f00202bbd03c'
        );

        if (!isGlobalAdmin) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

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

module.exports = router;
