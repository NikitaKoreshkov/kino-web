// Seed admin user
// Usage: npm run db:seed

const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

async function main() {
  const prisma = new PrismaClient()
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'change-me-please'

  // Stronger Argon2id parameters (OWASP-like):
  // timeCost = 3 iterations, memoryCost ~19 MiB, parallelism = 1
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 19456, // KiB (~19 MiB)
    parallelism: 1,
  })

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, role: 'ADMIN', name: 'Admin' },
  })

  console.log('Seeded admin user:', email)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
