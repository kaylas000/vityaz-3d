import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample user
  const user = await prisma.user.upsert({
    where: { walletAddress: '0xtest123' },
    update: {},
    create: {
      walletAddress: '0xtest123',
      displayName: 'VityazOperator',
      rank: 'OPERATOR',
      vityazBalance: 50000,
      level: 5,
      kills: 250,
      deaths: 50,
      wins: 45,
      losses: 15,
    },
  })

  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Weekly Tournament',
      status: 'ACTIVE',
      prizePool: 100000,
      maxPlayers: 100,
    },
  })

  console.log('Database seeded successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
