import prisma from '../lib/prisma';

async function addColumn() {
    try {
        console.log('Adding column...');
        await (prisma as any).$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ebayItemId" TEXT');
        console.log('Adding index...');
        await (prisma as any).$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Product_ebayItemId_key" ON "Product"("ebayItemId")');
        console.log('✅ Done');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

addColumn();
