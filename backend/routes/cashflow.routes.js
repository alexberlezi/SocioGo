const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/cashflow - Get all entries and summary
router.get('/', async (req, res) => {
    try {
        const entries = await prisma.cashFlowEntry.findMany({
            include: { categoryRef: true },
            orderBy: { date: 'desc' }
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

// POST /api/finance/cashflow - Create new entry
router.post('/', async (req, res) => {
    try {
        const { description, amount, date, type, categoryId } = req.body;

        if (!description || !amount || !date || !type || !categoryId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const entry = await prisma.cashFlowEntry.create({
            data: {
                description,
                amount: parseFloat(amount),
                date: new Date(date),
                type,
                categoryId: parseInt(req.body.categoryId)
            }
        });

        res.json(entry);
    } catch (error) {
        console.error('Error creating cash flow entry:', error);
        res.status(500).json({ error: 'Erro ao criar lançamento' });
    }
});

module.exports = router;
