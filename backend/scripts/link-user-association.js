const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkUserToAssociation() {
    try {
        // 1. Find ASEPA association
        const associations = await prisma.association.findMany();
        console.log('Available Associations:', associations.map(a => ({ id: a.id, name: a.name })));

        // Find Asepa - case insensitive search
        const asepa = associations.find(a => a.name.toLowerCase().includes('asepa'));

        if (!asepa) {
            console.log('❌ Asepa not found in associations');
            return;
        }

        console.log('\n✅ Found ASEPA:', asepa.id, asepa.name);

        // 2. Update Alex Berlezi user
        const updatedUser = await prisma.user.update({
            where: { id: 15 }, // Alex Berlezi's ID
            data: { associationId: asepa.id }
        });

        console.log('\n✅ User updated successfully!');
        console.log('   User ID:', updatedUser.id);
        console.log('   Email:', updatedUser.email);
        console.log('   AssociationId:', updatedUser.associationId);
        console.log('\n🔄 Please logout and login again to apply the changes.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

linkUserToAssociation();
