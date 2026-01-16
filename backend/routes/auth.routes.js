const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret for JWT - Should be in ENV
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

// Mock function for MFA Code Generation/Verification (Replace with speakeasy/otp lib later)
const verifyMfaCode = (secret, code) => {
    // For demo: code '123456' always passes if enabled
    return code === '123456';
};

// GET /api/auth/identify?email=...
// Returns: { exists: bool, mfaEnabled: bool, branding: { logo, color, name }, error?: string }
router.get('/identify', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                association: true, // Fetch tenant branding
                profile: true
            }
        });

        if (!user) {
            // Security: Don't reveal user existence too clearly, but for this specific UX (branding), we need to.
            // Returning generic branding if not found, or error?
            // User requested: Branding based on email domain or user link.
            // If user not found, return default branding.
            return res.json({
                exists: false,
                branding: getDefaultBranding(),
            });
        }

        // Check if Suspended
        if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
            return res.status(403).json({ error: 'Conta suspensa ou inativa. Contate o administrador.' });
        }

        // Check Association Status
        let branding = getDefaultBranding();

        if (user.association) {
            if (user.association.status !== 'ACTIVE') {
                return res.status(403).json({ error: 'A associação vinculada está inativa.' });
            }
            branding = {
                name: user.association.name,
                logoLight: user.association.logoLight,
                logoDark: user.association.logoDark,
                primaryColor: user.association.primaryColor || '#2563eb'
            };
        } else {
            // Try to fetch global branding from SystemSettings if Global Admin?
            // Or leave default SocioGo branding.
        }

        res.json({
            exists: true,
            mfaEnabled: user.mfaEnabled,
            branding
        });

    } catch (error) {
        console.error('Identify error:', error);
        res.status(500).json({ error: 'Erro ao identificar usuário' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password, mfaCode } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { association: true, profile: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Check Password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Check Status
        if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
            return res.status(403).json({ error: 'Conta suspensa.' });
        }
        if (user.association && user.association.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Associação inativa.' });
        }

        // MFA Check
        if (user.mfaEnabled) {
            if (!mfaCode) {
                return res.json({ mfaRequired: true });
            }
            // Verify Code
            // Ideally we check mfaSecret from DB.
            const validCode = verifyMfaCode(user.mfaSecret, mfaCode);
            if (!validCode) {
                return res.status(401).json({ error: 'Código MFA inválido' });
            }
        }

        // Update Last Login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Generate Token
        // Payload: Standard claims
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            associationId: user.associationId
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

        // Safe User Object
        const userObj = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.profile?.fullName || 'Usuário', // Should fetch profile if name needed
            associationId: user.associationId
        };

        res.json({
            token,
            user: userObj,
            mfaRequired: false
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

function getDefaultBranding() {
    return {
        name: 'SocioGo',
        logoLight: null, // Frontend uses default asset
        logoDark: null,
        primaryColor: '#2563eb' // Blue-600
    };
}

module.exports = router;
