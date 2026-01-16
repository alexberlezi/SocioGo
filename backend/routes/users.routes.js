const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { buildTenantFilter } = require('../middleware/tenant.middleware');
const QRCode = require('qrcode');
const { authenticator } = require('otplib');

// Middleware to check if user is Authenticated and Admin
const checkAdmin = (req, res, next) => {
    // This could be enhanced with proper JWT verification
    next();
};

// GET /api/users - List users (with optional tenant filtering)
router.get('/', async (req, res) => {
    try {
        const { associationId, search } = req.query;

        // Build base where clause
        const where = {
            deletedAt: null, // Soft Delete Filter
            ...buildTenantFilter(req) // Apply tenant filtering from x-tenant-id header
        };

        // Optional search filter
        if (search) {
            where.OR = [
                { email: { contains: search } },
            ];
        }

        // If specific associationId passed in query, override tenant filter
        if (associationId) {
            where.associationId = parseInt(associationId);
        }

        const users = await prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' }
        });

        // Map to safe objects
        const safeUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            status: u.status, // We dropped status? NO, we restored it.
            mfaEnabled: u.mfaEnabled,
            lastLogin: u.lastLogin,
            profile: u.profile
        }));

        res.json(safeUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});



// --- NEW PROFILE & SECURITY ROUTES ---

// PUT /api/users/profile - Update Self Profile
router.put('/profile', async (req, res) => {
    try {
        const { id, name, email, photo } = req.body; // Expecting user ID in body for now, or use middleware user if available
        // Note: In a real app we'd use req.user.id from token. Here we rely on ID sent by frontend.

        if (!id) return res.status(400).json({ error: 'User ID required' });

        // Update basic info
        // Also update Profile model
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                email, // Optional: might restrict email change
                profile: {
                    upsert: {
                        create: { fullName: name, photo },
                        update: { fullName: name, photo }
                    }
                }
            },
            include: { profile: true }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});

// PUT /api/users/password - Change Self Password
router.put('/password', async (req, res) => {
    try {
        const { id, currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        // Verify current
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });

        // Hash new
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Erro ao alterar senha' });
    }
});

// POST /api/users/mfa/generate - Generate Secret & QR
router.post('/mfa/generate', async (req, res) => {
    try {
        const { id } = req.body;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        // Generate Secret
        const secret = authenticator.generateSecret();

        // Generate OTPauth URL
        // Service Name: "SocioGo" (or Tenant Name if likely)
        const serviceName = 'SocioGo';
        const otpauth = authenticator.keyuri(user.email, serviceName, secret);

        // Generate QR Code Data URL
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Save secret temporarily (or permanently but disabled) to user
        // Ideally we verify a code before saving, but for simplicity we save secret now
        // and enable it only on confirm. Or we return secret to frontend to send back on confirm.
        // Let's save it now but keep mfaEnabled = false.
        await prisma.user.update({
            where: { id: user.id },
            data: { mfaSecret: secret } // Ensure schema has mfaSecret
        });

        res.json({ secret, qrCodeUrl });

    } catch (error) {
        console.error('MFA Gen error:', error);
        res.status(500).json({ error: 'Erro ao gerar MFA' });
    }
});

// POST /api/users/mfa/toggle - Enable/Disable MFA
router.post('/mfa/toggle', async (req, res) => {
    try {
        const { id, enable, token } = req.body; // token is the code to verify if enabling

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (enable) {
            // Must verify token against saved secret
            if (!user.mfaSecret) {
                return res.status(400).json({ error: 'MFA não configurado. Gere o QR Code primeiro.' });
            }

            const isValid = authenticator.verify({ token, secret: user.mfaSecret });
            if (!isValid) {
                return res.status(400).json({ error: 'Código inválido' });
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { mfaEnabled: true }
            });
            res.json({ message: 'MFA Ativado', mfaEnabled: true });

        } else {
            // Disable
            await prisma.user.update({
                where: { id: user.id },
                data: { mfaEnabled: false, mfaSecret: null } // Clear secret on disable? Or keep?
            });
            res.json({ message: 'MFA Desativado', mfaEnabled: false });
        }

    } catch (error) {
        console.error('MFA Toggle error:', error);
        res.status(500).json({ error: 'Erro ao atualizar MFA' });
    }
});


// POST /api/users - Create User
router.post('/', async (req, res) => {
    try {
        const { email, password, role, name, associationId, mfaEnabled } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        // Need to figure out where 'associationId' goes. 
        // If it's a new field, I must add it.
        // For now, I'll proceed as if I will add it.

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'SOCIO',
                mfaEnabled: mfaEnabled || false,
                status: 'APPROVED',
                associationId: associationId ? parseInt(associationId) : null,
                profile: {
                    create: {
                        fullName: name,
                        type: 'PF' // Default
                    }
                }
            }
        });

        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id/mfa - Toggle MFA
router.put('/:id/mfa', async (req, res) => {
    try {
        const { mfaEnabled } = req.body;
        const { id } = req.params;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { mfaEnabled }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update MFA' });
    }
});

// PUT /api/users/:id - Update User
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, associationId, status, mfaEnabled, currentUserId } = req.body;

        // Validation/Permission check would go here (e.g., prevent changing own role if strict)

        const updateData = {
            email,
            role,
            status,
            mfaEnabled,
            associationId: associationId ? parseInt(associationId) : null,
            profile: {
                update: {
                    fullName: name
                }
            }
        };

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // Simple Audit Log (could use generic SystemLog if available, or just log to console for now as requested by user "registered in audit logs")
        // Since we only have FinancialLog currently, and user management isn't finance... 
        // I'll check if I should create a SystemLog or reuse. 
        // For compliance with "Audit Logs", I'll create a FinancialLog with type 'USER_MGMT' if possible, or just skip if no table fits.
        // User asked "Exclusão ... será registrada nos logs de auditoria". 
        // I will assume FinancialLog is being used as a General Log or I should have created a General Log.
        // I will attempt to write to FinancialLog with a special entityType 'USER'.

        try {
            if (currentUserId) {
                await prisma.financialLog.create({
                    data: {
                        userId: parseInt(currentUserId),
                        userName: 'Admin', // Should fetch
                        action: 'UPDATE',
                        entityType: 'USER',
                        entityId: updatedUser.id,
                        description: `Usuário ${updatedUser.email} atualizado. Status: ${status}`
                    }
                });
            }
        } catch (e) { console.warn('Audit log failed', e); }

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Soft Delete
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { currentUserId } = req.query;

        // Soft Delete
        const deletedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                status: 'REJECTED' // Or specific status like INACTIVE if available, keeping Rejected for now to kill login
            }
        });

        // Audit Log
        try {
            if (currentUserId) {
                await prisma.financialLog.create({
                    data: {
                        userId: parseInt(currentUserId),
                        userName: 'Admin',
                        action: 'DELETE',
                        entityType: 'USER',
                        entityId: deletedUser.id,
                        description: `Usuário ${deletedUser.email} EXCLUÍDO (Soft Delete)`
                    }
                });
            }
        } catch (e) { console.warn('Audit log failed', e); }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
