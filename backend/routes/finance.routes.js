const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/finance/members/:id/history - Get member financial history
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
