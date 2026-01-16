const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting full system seeding...');

    // 1. Clear everything
    await prisma.financialRecord.deleteMany({});
    await prisma.cashFlowEntry.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});

    const now = new Date();

    // 2. Create Admin User
    console.log('Creating Admin User...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@sociogo.com',
            password: 'mudar123',
            role: 'ADMIN',
            status: 'APPROVED',
            profile: {
                create: {
                    fullName: 'Admin User',
                    type: 'PF',
                    phone: '55999999999'
                }
            }
        }
    });

    // 3. Create Alex Berlezi (Socio)
    console.log('Creating Alex Berlezi...');
    const alex = await prisma.user.create({
        data: {
            email: 'a@a.com.br',
            password: 'mudar123',
            role: 'SOCIO',
            status: 'APPROVED',
            profile: {
                create: {
                    fullName: 'Alex Berlezi',
                    type: 'PF',
                    cpf: '01769165045',
                    phone: '55996191715',
                }
            }
        }
    });

    // 4. Seed Alex's Financial History
    console.log('Seeding Alex Berlezi History...');
    // 10 Paid Months
    for (let i = 11; i >= 2; i--) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 10);
        await prisma.financialRecord.create({
            data: {
                userId: alex.id,
                type: 'MENSALIDADE',
                description: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 150.00,
                dueDate: dueDate,
                status: 'PAID',
                updatedAt: new Date(dueDate.getFullYear(), dueDate.getMonth(), 15)
            }
        });
    }

    // 2 Overdue Months
    for (let i = 1; i >= 0; i--) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 10);
        await prisma.financialRecord.create({
            data: {
                userId: alex.id,
                type: 'MENSALIDADE',
                description: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 150.00,
                dueDate: dueDate,
                status: 'OVERDUE'
            }
        });
    }

    // 5. Create 5 other members
    const otherMembers = [
        { name: 'Ricardo Santos', email: 'ricardo@test.com', status: 'PAID', amount: 200 },
        { name: 'Mariana Lima', email: 'mariana@test.com', status: 'OVERDUE', amount: 150 },
        { name: 'Carlos Oliveira', email: 'carlos@test.com', status: 'PENDING', amount: 300 },
        { name: 'Juliana Costa', email: 'juliana@test.com', status: 'PAID', amount: 150 },
        { name: 'Roberto Almeida', email: 'roberto@test.com', status: 'OVERDUE', amount: 450 }
    ];

    for (const m of otherMembers) {
        const user = await prisma.user.create({
            data: {
                email: m.email,
                password: 'mudar123',
                role: 'SOCIO',
                status: 'APPROVED',
                profile: {
                    create: {
                        fullName: m.name,
                        type: 'PF',
                        phone: '11999999999'
                    }
                }
            }
        });

        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5);
        await prisma.financialRecord.create({
            data: {
                userId: user.id,
                type: 'MENSALIDADE',
                description: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long' })}`,
                amount: m.amount,
                dueDate: dueDate,
                status: m.status,
                updatedAt: m.status === 'PAID' ? now : undefined
            }
        });
    }

    // 6. Seed Categories
    console.log('Seeding Categories...');
    const catData = [
        { name: 'Administrativo', color: '#6366f1', type: 'OUT' },
        { name: 'Marketing', color: '#ec4899', type: 'IN' },
        { name: 'Eventos', color: '#f59e0b', type: 'IN' },
        { name: 'Infraestrutura', color: '#10b981', type: 'OUT' },
        { name: 'Outros', color: '#94a3b8', type: 'OUT' }
    ];

    const categories = {};
    for (const c of catData) {
        const created = await prisma.category.create({ data: c });
        categories[c.name] = created.id;
    }

    // 7. Seed Cash Flow Entries
    console.log('Seeding Cash Flow entries...');
    const cashEvents = [
        { description: 'Patrocínio Evento A', amount: 5000, type: 'IN', categoryId: categories['Marketing'], date: new Date(now.getFullYear(), now.getMonth(), 5) },
        { description: 'Aluguel Sede', amount: 1200, type: 'OUT', categoryId: categories['Administrativo'], date: new Date(now.getFullYear(), now.getMonth(), 1) },
        { description: 'Manutenção Ar Condicionado', amount: 450, type: 'OUT', categoryId: categories['Infraestrutura'], date: new Date(now.getFullYear(), now.getMonth(), 10) },
        { description: 'Venda de Convites Estra', amount: 800, type: 'IN', categoryId: categories['Eventos'], date: new Date(now.getFullYear(), now.getMonth(), 12) }
    ];

    for (const ce of cashEvents) {
        await prisma.cashFlowEntry.create({
            data: ce
        });
    }

    console.log('System seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
