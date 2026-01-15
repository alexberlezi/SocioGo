const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/pending-members
router.get('/pending-members', async (req, res) => {
    try {
        const pendingMembers = await prisma.user.findMany({
            where: {
                status: 'PENDING',
                role: 'SOCIO' // Assuming only socios need approval
            },
            include: {
                profile: true,
                dependents: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(pendingMembers);
    } catch (error) {
        console.error('Error fetching pending members:', error);
        res.status(500).json({ error: 'Failed to fetch pending members' });
    }
});

// PATCH /api/admin/approve-member/:id
router.patch('/approve-member/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: 'APPROVED' }
        });

        // Simulate Email Sending
        console.log(`[EMAIL SIMULATION] Sending approval email to User ID ${id}...`);

        res.json({ message: 'Member approved successfully', user: updatedUser });
    } catch (error) {
        console.error('Error approving member:', error);
        res.status(500).json({ error: 'Failed to approve member' });
    }
});

// PATCH /api/admin/reject-member/:id
router.patch('/reject-member/:id', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body; // Reason for rejection

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: 'REJECTED' }
        });

        // Simulate Rejection Email
        console.log(`[EMAIL SIMULATION] Sending rejection email to User ID ${id}. Reason: ${reason}`);

        res.json({ message: 'Member rejected successfully', user: updatedUser });
    } catch (error) {
        console.error('Error rejecting member:', error);
        res.status(500).json({ error: 'Failed to reject member' });
    }
});

module.exports = router;
