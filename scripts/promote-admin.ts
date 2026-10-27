import { PrismaClient } from '@prisma/client'

// Usage: npm run admin:promote -- user@example.com
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npm run admin:promote -- <email>')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })
  console.log(`${user.email} is now an ADMIN`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
