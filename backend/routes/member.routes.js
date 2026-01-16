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

// PATCH /api/admin/members/:id/status - Update Member Status (Suspension, etc.)
router.patch('/members/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'SUSPENDED' or others

    // FUTURE TODO: Integrate with 'suspensionGracePeriod' parameter.
    // The system should check if the member owes fees for more than X months (defined in Association Settings)
    // before allowing automatic suspension jobs. Manual suspension (this route) overrides this check.

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json({ message: `Member status updated to ${status}`, user: updatedUser });
    } catch (error) {
        console.error('Error updating member status:', error);
        res.status(500).json({ error: 'Failed to update member status' });
    }
});

// GET /api/admin/members/:id - Get Single Member Details
router.get('/members/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const member = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                profile: true,
                dependents: true
            }
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (error) {
        console.error('Error fetching member details:', error);
        res.status(500).json({ error: 'Failed to fetch member details' });
    }
});

// PUT /api/admin/members/:id - Update Member Profile
router.put('/members/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body; // Expecting { email, role, status, profile: { ...fields } }

    try {
        // Separate User fields from Profile fields
        const { email, role, status, profile, dependents, ...otherUserFields } = data;

        // Prepare Update Data
        const updateData = {};

        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        // Update Profile if provided
        if (profile) {
            // Remove system fields that cannot be updated directly or might cause conflicts
            const {
                id: profileId,
                userId,
                createdAt,
                updatedAt,
                user, // circular reference potentially
                ...restProfile
            } = profile;

            // Handle Date Fields
            if (restProfile.birthDate) {
                restProfile.birthDate = new Date(restProfile.birthDate);
            } else if (restProfile.birthDate === '') {
                restProfile.birthDate = null;
            }

            // Sanitizing empty strings to null for optional unique fields if necessary, 
            // or just keeping as is (Prisma depends on DB nullability).
            // For now, let's trust the input unless it's a date.

            updateData.profile = {
                update: restProfile
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { profile: true }
        });

        res.json({ message: 'Member updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating member:', error);
        // Return actual error message for debugging
        res.status(500).json({ error: 'Failed to update member', details: error.message });
    }
});

// ... (existing PUT route)

// Configure Multer for Photo Upload
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/photos/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// PATCH /api/admin/members/:id/photo - Update Member Photo
router.patch('/members/:id/photo', upload.single('photo'), async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No photo file provided' });
        }

        // Construct public URL (assuming express.static is set up for 'uploads')
        // We will assume server.js maps '/uploads' to the uploads directory
        const photoUrl = `http://localhost:3000/uploads/photos/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                profile: {
                    update: {
                        docPartnerPhoto: photoUrl
                    }
                }
            },
            include: { profile: true }
        });

        res.json({
            message: 'Photo updated successfully',
            photoUrl: photoUrl,
            user: updatedUser
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo', details: error.message });
    }
});

module.exports = router;
