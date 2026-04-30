import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

type PrismaLog = (Prisma.LogLevel | Prisma.LogDefinition)[]

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL ?? ''
  const log: PrismaLog =
    process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']

  // Prisma 7 "client" engine requires accelerateUrl for prisma+postgres:// URLs
  // (local Prisma Postgres dev server uses the Accelerate protocol)
  if (databaseUrl.startsWith('prisma+postgres://') || databaseUrl.startsWith('prisma://')) {
    return new PrismaClient({ log, accelerateUrl: databaseUrl })
  }

  return new PrismaClient({ log })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
