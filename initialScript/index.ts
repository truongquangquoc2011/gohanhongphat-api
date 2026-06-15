import { Logger } from '@nestjs/common'
import { envConfig } from '../src/shared/config'
import { HashingService } from '../src/shared/services/hashing.service'
import { PrismaService } from '../src/shared/services/prisma.service'

const createAdminUser = async (
  prisma: PrismaService,
  hashingService: HashingService,
) => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: envConfig.adminEmail,
    },
  })

  if (existingAdmin) {
    Logger.warn(
      `Admin user with email ${envConfig.adminEmail} already exists. Skipping.`,
    )
    return existingAdmin
  }

  const hashedPassword = await hashingService.hashPassword(
    envConfig.adminPassword,
  )

  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.adminEmail,
      password: hashedPassword,
      fullname: envConfig.adminName,
      phoneNumber: envConfig.adminPhone,
      isActive: true,
      avatar: null,
    },
  })

  return adminUser
}

const main = async () => {
  const prisma = new PrismaService()
  const hashingService = new HashingService()

  await prisma.$connect()

  const adminUser = await createAdminUser(prisma, hashingService)

  await prisma.$disconnect()

  return adminUser
}

main()
  .then((adminUser) => {
    console.log('====================================')
    console.log('Seed completed successfully!')
    console.log(
      adminUser
        ? `Admin account: ${adminUser.email}`
        : 'No admin account created.',
    )
    console.log('====================================')
  })
  .catch(async (error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })