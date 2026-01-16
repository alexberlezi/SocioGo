const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/closure - list all months with status and summary
router.get('/', async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        // Fetch closures for the year
        const closures = await prisma.monthlyClosure.findMany({
            where: { year: targetYear }
        });

        // Generate list of 12 months for the requested year
        const monthsData = [];
        let accumulatedBalance = 0;


        const preYearIn = await prisma.cashFlowEntry.aggregate({
            where: {
                type: 'IN',
                date: { lt: new Date(`${targetYear}-01-01T00:00:00.000Z`) }
            },
            _sum: { amount: true }
        });
        const preYearOut = await prisma.cashFlowEntry.aggregate({
            where: {
                type: 'OUT',
                date: { lt: new Date(`${targetYear}-01-01T00:00:00.000Z`) }
            },
            _sum: { amount: true }
        });

        accumulatedBalance = ((preYearIn._sum.amount || 0) - (preYearOut._sum.amount || 0));

        for (let m = 1; m <= 12; m++) {
            const startDate = new Date(Date.UTC(targetYear, m - 1, 1));
            const endDate = new Date(Date.UTC(targetYear, m, 0, 23, 59, 59));

            // Transactions for this month
            const monthIn = await prisma.cashFlowEntry.aggregate({
                where: {
                    type: 'IN',
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: { amount: true }
            });

            const monthOut = await prisma.cashFlowEntry.aggregate({
                where: {
                    type: 'OUT',
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: { amount: true }
            });

            const totalIn = monthIn._sum.amount || 0;
            const totalOut = monthOut._sum.amount || 0;
            const monthBalance = totalIn - totalOut;
            const initialBalance = accumulatedBalance;
            const finalBalance = initialBalance + monthBalance;

            // Update accumulated for next month
            accumulatedBalance = finalBalance;

            const closureStatus = closures.find(c => c.month === m);

            monthsData.push({
                month: m,
                year: targetYear,
                status: closureStatus ? closureStatus.status : 'OPEN',
                initialBalance,
                totalIn,
                totalOut,
                finalBalance,
                closureDetails: closureStatus || null
            });
        }

        res.json(monthsData);
    } catch (error) {
        console.error('Error fetching monthly closures:', error);
        res.status(500).json({ error: 'Erro ao buscar fechamentos' });
    }
});

// Helper to check Audit Feature
const shouldLog = async () => {
    const settings = await prisma.systemSettings.findUnique({ where: { key: 'SAAS_FEATURES' } });
    return settings?.value?.AUDITORIA === true;
};

// POST /api/finance/closure - Execute Monthly Closure
router.post('/', async (req, res) => {
    try {
        const { month, year, userId } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: 'Mês e Ano são obrigatórios' });
        }

        // Validate date (cannot close future months)
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (year > currentYear || (year === currentYear && month > currentMonth)) {
            return res.status(400).json({ error: 'Não é possível fechar um mês futuro.' });
        }

        const closure = await prisma.monthlyClosure.upsert({
            where: {
                month_year: { month, year } // composite unique key
            },
            update: {
                status: 'CLOSED',
                closedAt: new Date(),
                closedBy: parseInt(userId) || 0
            },
            create: {
                month,
                year,
                status: 'CLOSED',
                closedAt: new Date(),
                closedBy: parseInt(userId) || 0
            }
        });

        // Audit Log
        if (await shouldLog()) {
            await prisma.financialLog.create({
                data: {
                    userId: parseInt(userId) || 0,
                    userName: 'Admin User', // Should ideally fetch user name
                    action: 'UPDATE', // Using UPDATE generically or add a specific action type if generic supports it, usually ENUM or String
                    entityType: 'MONTHLY_CLOSURE',
                    entityId: closure.id,
                    description: `Fechamento do mês ${month}/${year}`
                }
            });
        }

        res.json(closure);
    } catch (error) {
        console.error('Error closing month:', error);
        res.status(500).json({ error: 'Erro ao fechar o mês' });
    }
});

// POST /api/finance/closure/reopen
router.post('/reopen', async (req, res) => {
    try {
        const { month, year, userId, reason } = req.body;

        if (!month || !year || !reason) {
            return res.status(400).json({ error: 'Mês, Ano e Justificativa são obrigatórios' });
        }

        const closure = await prisma.monthlyClosure.update({
            where: {
                month_year: { month, year }
            },
            data: {
                status: 'OPEN',
                reopenedAt: new Date(),
                reopenedBy: parseInt(userId) || 0,
                reopenReason: reason
            }
        });

        // Audit Log
        if (await shouldLog()) {
            await prisma.financialLog.create({
                data: {
                    userId: parseInt(userId) || 0,
                    userName: 'Admin User',
                    action: 'UPDATE', // Or REOPEN if allowed
                    entityType: 'MONTHLY_CLOSURE',
                    entityId: closure.id,
                    description: `Mês ${month}/${year} REABERTO por Admin User. Motivo: ${reason}`
                }
            });
        }

        res.json(closure);
    } catch (error) {
        console.error('Error reopening month:', error);
        res.status(500).json({ error: 'Erro ao reabrir o mês' });
    }
});

// GET /api/finance/closure/check
router.get('/check', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Data obrigatória' });

        const d = new Date(date);
        const month = d.getUTCMonth() + 1; // Use UTC to avoid timezone shifts
        const year = d.getUTCFullYear();

        const closure = await prisma.monthlyClosure.findUnique({
            where: {
                month_year: { month, year }
            }
        });

        res.json({ status: closure ? closure.status : 'OPEN' });
    } catch (error) {
        console.error('Error checking closure status:', error);
        res.status(500).json({ error: 'Erro ao verificar status' });
    }
});

// GET /api/finance/closure/report - Get data for PDF report
router.get('/report', async (req, res) => {
    try {
        console.log('--- REPORT DEBUG START ---');
        console.log('Query:', req.query);
        const { month, year, userId } = req.query;

        // Bypass UserId validation for test if needed, but let's keep basic check
        if (!month || !year) throw new Error('Mês e Ano obrigatórios');

        const m = parseInt(month);
        const y = parseInt(year);

        // 1. Get Closure (Simple)
        let closure = null;
        try {
            closure = await prisma.monthlyClosure.findUnique({
                where: { month_year: { month: m, year: y } }
            });
        } catch (e) { console.error('Closure fetch error (ignoring):', e); }

        // 2. Fetch ALL transactions for the year to do manual JS calc (safest)
        // Or just fetch up to the end of request month to be more efficient
        const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59));

        const allTransactions = await prisma.cashFlowEntry.findMany({
            where: {
                date: { lte: endDate }
            },
            include: { categoryRef: true }
        });

        console.log(`Fetched ${allTransactions.length} transactions total.`);

        // 3. JS Calculation
        let initialBalance = 0;
        let totalIn = 0;
        let totalOut = 0;
        let breakdownMap = {};

        const startOfMonth = new Date(Date.UTC(y, m - 1, 1)).getTime();
        const endOfMonth = endDate.getTime();

        for (const t of allTransactions) {
            const tDate = new Date(t.date).getTime();
            const isPrior = tDate < startOfMonth;
            const isCurrent = tDate >= startOfMonth && tDate <= endOfMonth;

            // Initial Balance (prior to this month)
            if (isPrior) {
                if (t.type === 'IN') initialBalance += Number(t.amount);
                else initialBalance -= Number(t.amount);
            }

            // Current Month
            if (isCurrent) {
                if (t.type === 'IN') totalIn += Number(t.amount);
                else totalOut += Number(t.amount);

                // Breakdown
                // Schema uses 'categoryRef', not 'category'
                const catId = t.categoryId || 'null';
                const catName = t.categoryRef ? t.categoryRef.name : 'Sem Categoria';
                const catColor = t.categoryRef ? t.categoryRef.color : '#94a3b8'; // slate-400
                const key = `${catId}-${t.type}`;

                if (!breakdownMap[key]) {
                    breakdownMap[key] = {
                        categoryId: t.categoryId,
                        name: catName,
                        color: catColor,
                        type: t.type,
                        amount: 0
                    };
                }
                breakdownMap[key].amount += Number(t.amount);
            }
        }

        const finalBalance = initialBalance + totalIn - totalOut;
        const breakdown = Object.values(breakdownMap).sort((a, b) => b.amount - a.amount);

        console.log('Results:', { initialBalance, totalIn, totalOut, finalBalance });

        // 4. Audit Log (try/catch to not block report)
        try {
            if (userId) {
                await prisma.financialLog.create({
                    data: {
                        userId: parseInt(userId),
                        userName: 'Admin User',
                        action: 'EXPORT',
                        entityType: 'REPORT',
                        entityId: closure ? closure.id : 0,
                        description: `GERAÇÃO DE RELATÓRIO: Balancete ${m}/${y}`
                    }
                });
            }
        } catch (logErr) { console.warn('Audit Log failed:', logErr); }

        res.json({
            month: m,
            year: y,
            closureDate: closure ? closure.closedAt : null,
            summary: { initialBalance, totalIn, totalOut, finalBalance },
            breakdown
        });

    } catch (error) {
        console.error('CRITICAL REPORT ERROR:', error);
        // Return JSON even on error if possible, or plain text stack if requested, but JSON is safer for frontend 
        res.status(500).json({ error: 'Erro Interno: ' + error.message });
    }
});

module.exports = router;
