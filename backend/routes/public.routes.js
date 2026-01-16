const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/public/validate/:id
router.get('/validate/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Try to find user by ID (assuming ID is the numeric user ID)
        // If your system uses a dedicated "matricula" field in profile, adjust logic.
        // For now, assuming User.id is the matricula/identifier.
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                profile: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Sócio não encontrado.' });
        }

        // Return only necessary public data
        const publicData = {
            id: user.id.toString().padStart(6, '0'),
            name: user.profile?.fullName || user.email,
            role: user.profile?.jobRole || 'Sócio',
            status: user.status, // PENDING, APPROVED, SUSPENDED, REJECTED
            photo: user.profile?.docPartnerPhoto || null,
            validUntil: '12/2025' // Static or calculated logic
        };

        res.json(publicData);

    } catch (error) {
        console.error('Error identifying member:', error);
        res.status(500).json({ error: 'Erro interno ao validar documento.' });
    }
});

module.exports = router;
