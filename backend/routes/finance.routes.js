const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/members/:id/history - Get member financial history
// GET /api/finance/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 1. Metrics
        // Revenue (Paid this month)
        const revenue = await prisma.financialRecord.aggregate({
            where: {
                status: 'PAID',
                updatedAt: { gte: startOfMonth, lte: endOfMonth }
            },
            _sum: { amount: true }
        });

        // Delinquency (Total Overdue)
        const delinquency = await prisma.financialRecord.aggregate({
            where: { status: 'OVERDUE' },
            _sum: { amount: true }
        });

        // Projection (Pending this month)
        const projection = await prisma.financialRecord.aggregate({
            where: {
                status: 'PENDING',
                dueDate: { lte: endOfMonth }
            },
            _sum: { amount: true }
        });

        // New Members (Current Month)
        const newMembersCount = await prisma.user.count({
            where: {
                createdAt: { gte: startOfMonth, lte: endOfMonth },
                role: 'SOCIO'
            }
        });

        // 2. Chart Data (Last 6 Months)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });

            const paid = await prisma.financialRecord.aggregate({
                where: { status: 'PAID', dueDate: { gte: mStart, lte: mEnd } },
                _sum: { amount: true }
            });
            const pending = await prisma.financialRecord.aggregate({
                where: { status: { in: ['PENDING', 'OVERDUE'] }, dueDate: { gte: mStart, lte: mEnd } },
                _sum: { amount: true }
            });

            chartData.push({
                name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                pago: Number(paid._sum.amount) || 0,
                pendente: Number(pending._sum.amount) || 0
            });
        }

        // 3. Upcoming Payments
        const upcoming = await prisma.financialRecord.findMany({
            where: { status: 'PENDING', dueDate: { gte: now } },
            take: 5,
            orderBy: { dueDate: 'asc' },
            include: { user: { include: { profile: true } } }
        });

        // 4. Critical Delays
        const critical = await prisma.financialRecord.findMany({
            where: { status: 'OVERDUE' },
            take: 5,
            orderBy: { dueDate: 'asc' },
            include: { user: { include: { profile: true } } }
        });

        // 5. Expense Distribution (Current Month)
        const expenses = await prisma.cashFlowEntry.findMany({
            where: {
                type: 'OUT',
                date: { gte: startOfMonth, lte: endOfMonth }
            },
            include: { categoryRef: true }
        });

        const distributionMap = expenses.reduce((acc, entry) => {
            const catId = entry.categoryId || 0;
            const catName = entry.categoryRef?.name || entry.category || 'Sem Categoria';
            const catColor = entry.categoryRef?.color || '#64748B';

            if (!acc[catId]) {
                acc[catId] = { name: catName, value: 0, color: catColor };
            }
            acc[catId].value += Number(entry.amount);
            return acc;
        }, {});

        const expenseDistribution = Object.values(distributionMap);

        res.json({
            metrics: {
                revenue: Number(revenue._sum.amount) || 0,
                delinquency: Number(delinquency._sum.amount) || 0,
                projection: Number(projection._sum.amount) || 0,
                newMembers: newMembersCount
            },
            chartData,
            expenseDistribution,
            upcoming: upcoming.map(r => ({
                id: r.id,
                memberName: r.user.profile?.fullName || r.user.profile?.socialReason || 'Sócio',
                amount: r.amount,
                dueDate: r.dueDate,
                phone: r.user.profile?.phone
            })),
            critical: critical.map(r => ({
                id: r.id,
                memberName: r.user.profile?.fullName || r.user.profile?.socialReason || 'Sócio',
                amount: r.amount,
                daysOverdue: Math.floor((now - new Date(r.dueDate)) / (1000 * 60 * 60 * 24)),
                phone: r.user.profile?.phone
            }))
        });

    } catch (error) {
        console.error('Error fetching finance dashboard:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard financeiro' });
    }
});

router.get('/members/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const memberId = parseInt(id);

        // 1. Fetch member details
        const member = await prisma.user.findUnique({
            where: { id: memberId },
            include: {
                profile: true
            }
        });

        if (!member) {
            return res.status(404).json({ error: 'Membro não encontrado' });
        }

        // 2. Fetch all financial records for the table
        const allRecords = await prisma.financialRecord.findMany({
            where: { userId: memberId },
            orderBy: { dueDate: 'desc' }
        });

        // 3. Prepare chart data (Last 12 months)
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        const chartRecords = await prisma.financialRecord.findMany({
            where: {
                userId: memberId,
                dueDate: {
                    gte: twelveMonthsAgo
                }
            }
        });

        // Group by month for recharts
        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const chartData = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
            const monthName = months[date.getMonth()];
            const year = date.getFullYear();

            const monthRecords = chartRecords.filter(r => {
                const rDate = new Date(r.dueDate);
                return rDate.getMonth() === date.getMonth() && rDate.getFullYear() === date.getFullYear();
            });

            const paid = monthRecords
                .filter(r => r.status === 'PAID')
                .reduce((sum, r) => sum + parseFloat(r.amount), 0);

            const pending = monthRecords
                .filter(r => r.status === 'PENDING' || r.status === 'OVERDUE')
                .reduce((sum, r) => sum + parseFloat(r.amount), 0);

            chartData.push({
                name: `${monthName}`,
                pago: paid,
                pendente: pending
            });
        }

        res.json({
            member: {
                id: member.id,
                email: member.email,
                role: member.role,
                fullName: member.profile?.fullName,
                socialReason: member.profile?.socialReason,
                jobRole: member.profile?.jobRole,
                photo: member.profile?.docPartnerPhoto,
                type: member.profile?.type,
                status: member.status
            },
            history: allRecords,
            chartData
        });

    } catch (error) {
        console.error('Error fetching member finance history:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico financeiro' });
    }
});

module.exports = router;
