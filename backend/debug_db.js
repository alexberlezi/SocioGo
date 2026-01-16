const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        take: 5,
        include: { profile: true }
    });
    console.log(JSON.stringify(users, null, 2));

    const records = await prisma.financialRecord.findMany({
        take: 5
    });
    console.log('--- Records ---');
    console.log(JSON.stringify(records, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
