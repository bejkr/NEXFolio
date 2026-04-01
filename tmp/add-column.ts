import prisma from '../lib/prisma';

async function addColumn() {
    console.log('--- Adding ebayItemId column via raw SQL ---');
    try {
        await (prisma as any).$executeRawUnsafe(`
            ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ebayItemId" TEXT;
            CREATE UNIQUE INDEX IF NOT EXISTS "Product_ebayItemId_key" ON "Product"("ebayItemId");
        `);
        console.log('✅ Success!');
    } catch (error: any) {
        console.error('❌ Failed to add column:', error.message);
    }
}

addColumn();
