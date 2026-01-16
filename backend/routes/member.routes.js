const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/members - Advanced List with Pagination/Filtering
router.get('/members', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            q,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build Where Clause
        const where = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (type && type !== 'ALL') {
            where.profile = { ...where.profile, type };
        }

        if (q) {
            where.OR = [
                { profile: { fullName: { contains: q } } }, // SQLite is case-insensitive by default in many configs, but Prisma might need mode: 'insensitive' for Postgres/Mongo. For SQLite/MySQL generic, this is usually simplified.
                { profile: { socialReason: { contains: q } } },
                { profile: { cpf: { contains: q } } },
                { profile: { cnpj: { contains: q } } },
                { email: { contains: q } }
            ];
        }

        // Build OrderBy
        let orderBy = {};
        if (sortBy === 'name') {
            // Sort by relational field needs specific structure or raw query, but simplified for single list:
            // Prisma doesn't easily sort by relation prop at top level without specific syntax depending on version.
            // Fallback: sort by createdAt if name sort is complex, or try basic relative sort.
            // For simplicity in this iteration, let's stick to easy fields or handle name manually if needed (but manual break pagination).
            // Let's assume sorting by main user fields or profile fields via relation syntax if supported.
            // Attempting Relation Sort:
            orderBy = { profile: { fullName: order } };
        } else {
            orderBy = { [sortBy]: order };
        }

        // Execute Query
        const [members, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take,
                where,
                include: { profile: true },
                orderBy
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            data: members,
            meta: {
                total,
                page: parseInt(page),
                lastPage: Math.ceil(total / take)
            }
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

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
