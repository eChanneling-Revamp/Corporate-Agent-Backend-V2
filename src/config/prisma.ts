import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';

// Create a singleton instance of Prisma Client
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    errorFormat: 'pretty',
  });

// Log Prisma queries in development
if (process.env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: Prisma.QueryEvent) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

// Log Prisma errors
(prisma as any).$on('error', (e: Prisma.LogEvent) => {
  logger.error('Prisma Error:', e);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;