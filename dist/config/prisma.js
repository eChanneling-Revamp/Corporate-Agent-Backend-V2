"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const prisma = globalThis.__prisma ||
    new client_1.PrismaClient({
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
exports.prisma = prisma;
// Log Prisma queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger_1.logger.debug('Query: ' + e.query);
        logger_1.logger.debug('Params: ' + e.params);
        logger_1.logger.debug('Duration: ' + e.duration + 'ms');
    });
}
// Log Prisma errors
prisma.$on('error', (e) => {
    logger_1.logger.error('Prisma Error:', e);
});
// Handle graceful shutdown
process.on('beforeExit', async () => {
    logger_1.logger.info('Disconnecting from database...');
    await prisma.$disconnect();
});
if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map