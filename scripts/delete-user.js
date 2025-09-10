// Usage: node scripts/delete-user.js admin@example.com
const { PrismaClient } = require('@prisma/client');

(async () => {
  const email = process.argv[2] || 'admin@example.com';
  const prisma = new PrismaClient();
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      console.log(`User not found: ${email}`);
      return;
    }
    if (process.env.SUPERADMIN_EMAIL === email) {
      console.error('Refusing to delete SUPERADMIN_EMAIL user. Change SUPERADMIN_EMAIL first if needed.');
      process.exitCode = 1;
      return;
    }
    await prisma.user.delete({ where: { email } });
    console.log(`Deleted user: ${email}`);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
