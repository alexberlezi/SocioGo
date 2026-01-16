const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');

// Multer Config for Logo Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Helper: Check Global Admin
const checkGlobalAdmin = async (userId) => {
    // Check for hardcoded Super Admin UUID first
    if (userId === '875b818e-aa0d-40af-885a-f00202bbd03c') return true;

    const numericId = parseInt(userId);
    const whereClause = isNaN(numericId) ? { id: userId } : { id: numericId };

    try {
        const user = await prisma.user.findUnique({ where: whereClause });
        if (!user) return false;

        return (user.role === 'GLOBAL_ADMIN' || user.role === 'ADMIN' || user.role === 'Admin Global' || String(user.id) === '1');
    } catch (e) {
        return false;
    }
};

// GET /api/companies - List all associations with metrics
router.get('/', async (req, res) => {
    try {
        const companies = await prisma.association.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        users: true // Total accounts
                    }
                },
                // For active MEMBERS, we need to filter. _count alone doesn't support complex filters in include easily without distinct query or groupBy.
                // However, Prisma doesn't support filtered relation count in findMany 'include' directly in all versions efficiently.
                // A workaround is to fetch users and map, or use a separate aggregation.
                // For now, let's fetch basic counts. We'll simulate "Active Members" as just "Users with implicit Role=SOCIO" if we could, 
                // but since we can't filter _count easily here without extra load, let's just return total users and maybe total financial records if needed.
                // Let's stick to _count users for "System Users".
                // For "Members", if we assume Members are Users, then it's the same.
                // Let's refine: "Users" = All logins. "Members" = perhaps checking a specific flag?
                // For now, if schema doesn't distinguish, let's just use 'users' count for "Users" and Mock "Active Members" or use same count.
                // Actually, let's do a second query for members if critical, or just use:
                // users: { where: { role: 'SOCIO' } } -> this pulls data.
                // Let's try to pull 'users' with select id, role.
            }
        });

        // Optimization: if lists get huge, this is heavy. But for admin panel of companies, it's fine (usually < 100).
        const companiesWithCounts = await Promise.all(companies.map(async (c) => {
            const memberCount = await prisma.user.count({
                where: {
                    associationId: c.id,
                    role: 'SOCIO',
                    status: 'APPROVED'
                }
            });
            // Total users count is already in c._count.users
            return {
                ...c,
                totalUsers: c._count.users,
                activeMembers: memberCount
            };
        }));

        res.json(companiesWithCounts);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Erro ao buscar associações' });
    }
});

// POST /api/companies - Create Association
router.post('/', upload.fields([{ name: 'logoLight', maxCount: 1 }, { name: 'logoDark', maxCount: 1 }]), async (req, res) => {
    try {
        const { userId, name, cnpj, status, zipCode, street, number, district, city, state, whatsapp, email, primaryColor } = req.body;

        if (!await checkGlobalAdmin(userId)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const files = req.files || {};
        const logoLightPath = files['logoLight'] ? files['logoLight'][0].path.replace(/\\/g, '/') : null;
        const logoDarkPath = files['logoDark'] ? files['logoDark'][0].path.replace(/\\/g, '/') : null;

        const logoLightUrl = logoLightPath ? `http://localhost:3000/${logoLightPath}` : 'http://localhost:3000/uploads/logo_default.png';
        const logoDarkUrl = logoDarkPath ? `http://localhost:3000/${logoDarkPath}` : 'http://localhost:3000/uploads/logo_default.png';

        const newCompany = await prisma.association.create({
            data: {
                name,
                cnpj,
                status: status || 'ACTIVE',
                primaryColor: primaryColor || '#2563eb',
                zipCode, street, number, district, city, state,
                whatsapp, email,
                logoLight: logoLightUrl,
                logoDark: logoDarkUrl
            }
        });

        res.json(newCompany);
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ error: 'Erro ao criar associação' });
    }
});

// PUT /api/companies/:id - Update Association
router.put('/:id', upload.fields([{ name: 'logoLight', maxCount: 1 }, { name: 'logoDark', maxCount: 1 }]), async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, name, cnpj, status, zipCode, street, number, district, city, state, whatsapp, email, primaryColor } = req.body;

        if (!await checkGlobalAdmin(userId)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const files = req.files || {};
        const logoLightPath = files['logoLight'] ? files['logoLight'][0].path.replace(/\\/g, '/') : null;
        const logoDarkPath = files['logoDark'] ? files['logoDark'][0].path.replace(/\\/g, '/') : null;

        const dataToUpdate = {
            name,
            cnpj,
            status: status || 'ACTIVE',
            primaryColor, // Update color if provided
            zipCode, street, number, district, city, state,
            whatsapp, email
        };

        if (logoLightPath) dataToUpdate.logoLight = `http://localhost:3000/${logoLightPath}`;
        if (logoDarkPath) dataToUpdate.logoDark = `http://localhost:3000/${logoDarkPath}`;

        const updatedCompany = await prisma.association.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        res.json(updatedCompany);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ error: 'Erro ao atualizar associação' });
    }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.query; // Pass userId via query for delete
        const { id } = req.params;

        if (!await checkGlobalAdmin(userId)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await prisma.association.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Associação removida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover' });
    }
});

module.exports = router;
