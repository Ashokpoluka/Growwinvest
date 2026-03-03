import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
    static async log(userId: number, action: string, entity: string, entityId?: string, details?: any, ipAddress?: string) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entity,
                    entityId: entityId?.toString(),
                    details: details ? JSON.stringify(details) : null,
                    ipAddress
                }
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
}
