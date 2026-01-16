const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const app = express();
const prisma = new PrismaClient();

// Configure Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Validation Schemas (Zod) - Simplified for server-side
// Full validation should match frontend Zod schema
const registerSchema = z.object({
    // Identity
    type: z.enum(['PF', 'PJ']),
    email: z.string().email(),
    password: z.string().default("mudar123"), // Default password, user should set logic later or pass it consistently

    // PF
    fullName: z.string().optional(),
    cpf: z.string().optional(),
    birthDate: z.string().optional(),
    phone: z.string().optional(),

    // PJ
    socialReason: z.string().optional(),
    fantasyName: z.string().optional(),
    cnpj: z.string().optional(),
    stateRegistration: z.string().optional(),
    responsibleName: z.string().optional(),
    responsibleCpf: z.string().optional(),

    // Address
    zipCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),

    // Professional / Company
    education: z.string().optional(),
    professionalRegistry: z.string().optional(),
    currentCompany: z.string().optional(),
    jobRole: z.string().optional(),
    activityBranch: z.string().optional(),
    employeeCount: z.string().transform((val) => val ? parseInt(val) : undefined).optional(),
    website: z.string().optional(),

    // Extra
    bio: z.string().optional(),
    skills: z.string().optional(),
    isPublicConsent: z.string().transform(val => val === 'true').optional(), // Multipart sends strings

    // Dependents (JSON stringified)
    dependents: z.string().optional()
});

// Endpoint: Register User
app.post('/api/register', upload.fields([
    { name: 'docRgCnh', maxCount: 1 },
    { name: 'docCpf', maxCount: 1 },
    { name: 'docDiploma', maxCount: 1 },
    { name: 'docProfessionalRegistry', maxCount: 1 },
    { name: 'docSocialContract', maxCount: 1 },
    { name: 'docCnpjCard', maxCount: 1 },
    { name: 'docResponsibleRg', maxCount: 1 },
    { name: 'docPartnerPhoto', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('Receiving registration data:', req.body);
        console.log('Receiving files:', req.files);

        // Validate request body
        const validatedData = registerSchema.parse(req.body);

        // Prepare file paths
        const files = req.files || {};
        const getPath = (fieldname) => files[fieldname] ? files[fieldname][0].path : null;

        // Transaction to create User, Profile, Dependents
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: validatedData.password, // IMPORTANT: Should hash this in real app (bcrypt)
                    role: 'SOCIO',
                    status: 'PENDING',
                }
            });

            // 2. Prepare Dependents Data for return/logging (processed after user creation if nested write not used)
            // Actually we can create profile and dependents separately using userId

            // 3. Create Profile
            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    type: validatedData.type,

                    // PF
                    fullName: validatedData.fullName,
                    cpf: validatedData.cpf,
                    birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
                    phone: validatedData.phone,

                    // PJ
                    socialReason: validatedData.socialReason,
                    fantasyName: validatedData.fantasyName,
                    cnpj: validatedData.cnpj,
                    stateRegistration: validatedData.stateRegistration,
                    responsibleName: validatedData.responsibleName,
                    responsibleCpf: validatedData.responsibleCpf,

                    // Address
                    zipCode: validatedData.zipCode,
                    street: validatedData.street,
                    number: validatedData.number,
                    complement: validatedData.complement,
                    district: validatedData.district,
                    city: validatedData.city,
                    state: validatedData.state,

                    // Professional / Company
                    education: validatedData.education,
                    professionalRegistry: validatedData.professionalRegistry,
                    currentCompany: validatedData.currentCompany,
                    jobRole: validatedData.jobRole,
                    activityBranch: validatedData.activityBranch,
                    employeeCount: validatedData.employeeCount,
                    website: validatedData.website,

                    // Compliance
                    isPublicConsent: validatedData.isPublicConsent || false,

                    // Documents
                    docRgCnh: getPath('docRgCnh'),
                    docCpf: getPath('docCpf'),
                    docDiploma: getPath('docDiploma'),
                    docProfessionalRegistry: getPath('docProfessionalRegistry'),
                    docSocialContract: getPath('docSocialContract'),
                    docCnpjCard: getPath('docCnpjCard'),
                    docResponsibleRg: getPath('docResponsibleRg'),
                }
            });

            // 4. Create Dependents
            if (validatedData.dependents) {
                try {
                    const dependentsList = JSON.parse(validatedData.dependents);
                    if (Array.isArray(dependentsList) && dependentsList.length > 0) {
                        await tx.dependent.createMany({
                            data: dependentsList.map(dep => ({
                                userId: user.id,
                                name: dep.name,
                                kinship: dep.kinship,
                                birthDate: new Date(dep.birthDate)
                            }))
                        });
                    }
                } catch (e) {
                    console.error("Error parsing dependents:", e);
                }
            }

            return user;
        });

        res.status(201).json({ message: 'Cadastro realizado com sucesso!', userId: result.id });

    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Email ou CPF/CNPJ já cadastrado.' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Public Routes
const publicRoutes = require('./routes/public.routes');
app.use('/api/public', publicRoutes);

// Member Routes
const memberRoutes = require('./routes/member.routes');
app.use('/api/admin', memberRoutes);

// Finance Routes
const financeRoutes = require('./routes/finance.routes');
app.use('/api/finance', financeRoutes);

// CashFlow Routes
const cashFlowRoutes = require('./routes/cashflow.routes');
app.use('/api/cashflow', cashFlowRoutes);

// Categories Routes
const categoryRoutes = require('./routes/categories.routes');
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
