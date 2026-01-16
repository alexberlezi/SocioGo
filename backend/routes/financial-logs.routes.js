const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/logs - Get all financial audit logs with filters
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        const where = {};

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.timestamp.lte = end;
            }
        }

        if (userId) {
            where.userId = parseInt(userId);
        }

        const logs = await prisma.financialLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 200 // Increased limit for better historical view
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching financial logs:', error);
        res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
    }
});

module.exports = router;
