const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    const email = 'admin@sociogo.com';
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create admin user
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    status: 'APPROVED',
                    profile: {
                        create: {
                            fullName: 'Administrador',
                            type: 'PF'
                        }
                    }
                }
            });
            console.log('✅ Admin user created:', user.email);
        } else {
            // Update password
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    status: 'APPROVED'
                }
            });
            console.log('✅ Admin password reset for:', user.email);
        }

        console.log('New password:', newPassword);
        console.log('Role:', user.role);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
