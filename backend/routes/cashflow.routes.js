const express = require('express');
const router = express.Router();
const { buildTenantFilter } = require('../middleware/tenant.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/cashflow - Get all entries and summary
router.get('/', async (req, res) => {
    try {
        const where = buildTenantFilter(req);

        const entries = await prisma.cashFlowEntry.findMany({
            where,
            include: { categoryRef: true },
            orderBy: { createdAt: 'desc' }
        });

        const summary = entries.reduce((acc, entry) => {
            const amount = Number(entry.amount);
            if (entry.type === 'IN') {
                acc.totalIn += amount;
            } else {
                acc.totalOut += amount;
            }
            return acc;
        }, { totalIn: 0, totalOut: 0 });

        summary.balance = summary.totalIn - summary.totalOut;

        res.json({ entries, summary });
    } catch (error) {
        console.error('Error fetching cash flow:', error);
        res.status(500).json({ error: 'Erro ao buscar fluxo de caixa' });
    }
});

// Helper to check Audit Feature
const shouldLog = async () => {
    const settings = await prisma.systemSettings.findUnique({ where: { key: 'SAAS_FEATURES' } });
    return settings?.value?.AUDITORIA === true;
};

// POST /api/finance/cashflow - Create new entry
router.post('/', async (req, res) => {
    try {
        const { description, amount, date, type, categoryId, operatorId, operatorName } = req.body;

        if (!description || !amount || !date || !type || !categoryId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Helper to ensure date is treated as noon UTC to avoid timezone shifts
        const parseDate = (dateStr) => {
            if (!dateStr) return new Date();
            // If it's a simple YYYY-MM-DD string, append noon UTC time
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return new Date(`${dateStr}T12:00:00Z`);
            }
            return new Date(dateStr);
        };

        const entry = await prisma.cashFlowEntry.create({
            data: {
                description,
                amount: parseFloat(amount),
                date: parseDate(date),
                type,
                categoryId: parseInt(categoryId),
                operatorId: operatorId ? parseInt(operatorId) : null,
                operatorName: operatorName || 'Admin User',
                associationId: req.tenantId // Link to current tenant
            }
        });

        // Audit Log
        if (await shouldLog()) {
            await prisma.financialLog.create({
                data: {
                    userId: operatorId ? parseInt(operatorId) : 0,
                    userName: operatorName || 'Admin User',
                    action: 'CREATE',
                    entityType: 'CASH_FLOW',
                    entityId: entry.id,
                    newValue: entry,
                    entityId: entry.id,
                    newValue: entry,
                    description: `Lançamento de ${type === 'IN' ? 'Entrada' : 'Saída'}: ${description} - R$ ${amount}`,
                    associationId: req.tenantId
                }
            });
        }

        res.json(entry);
    } catch (error) {
        console.error('Error creating cash flow entry:', error);
        res.status(500).json({ error: 'Erro ao criar lançamento' });
    }
});

// PUT /api/finance/cashflow/:id - Update entry
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, date, type, categoryId, operatorId, operatorName } = req.body;

        const oldEntry = await prisma.cashFlowEntry.findUnique({
            where: { id: parseInt(id) }
        });

        if (!oldEntry) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        // Reuse parseDate logic (you could extract this to a utility if preferred)
        const parseDate = (dateStr) => {
            if (!dateStr) return new Date();
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return new Date(`${dateStr}T12:00:00Z`);
            }
            return new Date(dateStr);
        };

        const entry = await prisma.cashFlowEntry.update({
            where: { id: parseInt(id) },
            data: {
                description,
                amount: parseFloat(amount),
                date: parseDate(date),
                type,
                categoryId: parseInt(categoryId),
                operatorId: operatorId ? parseInt(operatorId) : oldEntry.operatorId,
                operatorName: operatorName || oldEntry.operatorName
            }
        });

        // Audit Log
        if (await shouldLog()) {
            await prisma.financialLog.create({
                data: {
                    userId: operatorId ? parseInt(operatorId) : 0,
                    userName: operatorName || 'Admin User',
                    action: 'UPDATE',
                    entityType: 'CASH_FLOW',
                    entityId: entry.id,
                    oldValue: oldEntry,
                    newValue: entry,
                    description: `Edição de lançamento: ${description} (R$ ${oldEntry.amount} -> R$ ${amount})`
                }
            });
        }

        res.json(entry);
    } catch (error) {
        console.error('Error updating cash flow entry:', error);
        res.status(500).json({ error: 'Erro ao editar lançamento' });
    }
});

// DELETE /api/finance/cashflow/:id - Delete entry
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { operatorId, operatorName } = req.query; // Passed via query for delete

        const oldEntry = await prisma.cashFlowEntry.findUnique({
            where: { id: parseInt(id) }
        });

        if (!oldEntry) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        await prisma.cashFlowEntry.delete({
            where: { id: parseInt(id) }
        });

        // Audit Log
        if (await shouldLog()) {
            await prisma.financialLog.create({
                data: {
                    userId: operatorId ? parseInt(operatorId) : 0,
                    userName: operatorName || 'Admin User',
                    action: 'DELETE',
                    entityType: 'CASH_FLOW',
                    entityId: parseInt(id),
                    oldValue: oldEntry,
                    description: `Exclusão de lançamento: ${oldEntry.description} - R$ ${oldEntry.amount}`
                }
            });
        }

        res.json({ message: 'Lançamento excluído com sucesso' });
    } catch (error) {
        console.error('Error deleting cash flow entry:', error);
        res.status(500).json({ error: 'Erro ao excluir lançamento' });
    }
});

module.exports = router;
