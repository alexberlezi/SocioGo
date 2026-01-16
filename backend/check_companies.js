const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const companies = await prisma.association.findMany();
        console.log('Associations found:', companies.length);
        console.log(JSON.stringify(companies, null, 2));
    } catch (e) {
        console.error('Error querying associations:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
