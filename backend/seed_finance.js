const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting finance seeding...');

    // 1. Clear existing financial records (optional, but good for clean seed)
    await prisma.financialRecord.deleteMany({});

    const now = new Date();

    // 2. Alex Berlezi (ID 1)
    console.log('Seeding Alex Berlezi (ID 1)...');

    // 10 Paid Months
    for (let i = 11; i >= 2; i--) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 10);
        await prisma.financialRecord.create({
            data: {
                userId: 1,
                type: 'MENSALIDADE',
                description: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 150.00,
                dueDate: dueDate,
                status: 'PAID',
                updatedAt: new Date(dueDate.getFullYear(), dueDate.getMonth(), 15) // Paid 5 days later
            }
        });
    }

    // 2 Overdue Months
    for (let i = 1; i >= 0; i--) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 10);
        await prisma.financialRecord.create({
            data: {
                userId: 1,
                type: 'MENSALIDADE',
                description: `Mensalidade ${dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: 150.00,
                dueDate: dueDate,
                status: 'OVERDUE'
            }
        });
    }

    // 3. Create 5 other members
    const otherMembers = [
        { name: 'Ricardo Santos', email: 'ricardo@test.com', status: 'PAID', amount: 200 },
        { name: 'Mariana Lima', email: 'mariana@test.com', status: 'OVERDUE', amount: 150 },
        { name: 'Carlos Oliveira', email: 'carlos@test.com', status: 'PENDING', amount: 300 },
        { name: 'Juliana Costa', email: 'juliana@test.com', status: 'PAID', amount: 150 },
        { name: 'Roberto Almeida', email: 'roberto@test.com', status: 'OVERDUE', amount: 450 }
    ];

    for (const m of otherMembers) {
        console.log(`Seeding member: ${m.name}...`);

        // Upsert user to avoid duplicates if re-run
        const user = await prisma.user.upsert({
            where: { email: m.email },
            update: {},
            create: {
                email: m.email,
                password: 'hashed_password', // Mock password
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

        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5); // Current month
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

    console.log('Finance seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
