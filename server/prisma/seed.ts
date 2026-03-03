import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Seed User
    await prisma.user.upsert({
        where: { email: 'admin@groww.com' },
        update: {},
        create: {
            email: 'admin@groww.com',
            name: 'Admin User',
            password: hashedPassword,
        },
    });

    // Seed Categories
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: { name: 'Electronics', description: 'Gadgets and hardware' },
    });

    const office = await prisma.category.upsert({
        where: { name: 'Office Supplies' },
        update: {},
        create: { name: 'Office Supplies', description: 'Stationery and furniture' },
    });

    // Seed Suppliers
    const techCorp = await prisma.supplier.create({
        data: { name: 'TechCorp India', contact: '9998887776', address: 'Bangalore, KA' }
    });

    // Seed Products
    await prisma.product.create({
        data: {
            name: 'ThinkPad X1 Carbon',
            sku: 'TP-X1-2026',
            unitPrice: 125000,
            stockLevel: 10,
            lowStockThreshold: 3,
            categoryId: electronics.id,
            supplierId: techCorp.id,
        }
    });

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
