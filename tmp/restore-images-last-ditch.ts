import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function lastDitchRestoration() {
    const scraperDir = path.join(process.cwd(), '.cache', 'scraper');
    const cacheFiles = fs.existsSync(scraperDir) ? fs.readdirSync(scraperDir).filter(f => f.endsWith('.html')).map(f => path.join(scraperDir, f)) : [];

    const missingProducts = await (prisma as any).product.findMany({
        where: { imageUrl: { contains: 'ebayimg.com' } },
        select: { id: true, externalId: true, name: true }
    });

    console.log(`Searching for ${missingProducts.length} missing products in cache...`);

    for (const product of missingProducts) {
        let imageUrl = null;

        for (const filePath of cacheFiles) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes(product.externalId)) {
                // Found the slug! Now find the nearest image.
                const slugPos = content.indexOf(product.externalId);
                const imgRegex = /https:\/\/product-images\.s3\.cardmarket\.com\/[^"&? \n]+/g;
                let match;
                let bestImg = null;
                let minDist = Infinity;

                while ((match = imgRegex.exec(content)) !== null) {
                    const absDist = Math.abs(match.index - slugPos);
                    if (absDist < 5000 && absDist < minDist) {
                        minDist = absDist;
                        bestImg = match[0];
                    }
                }

                if (bestImg) {
                    imageUrl = bestImg;
                    break;
                }
            }
        }

        if (imageUrl) {
            await (prisma as any).product.update({
                where: { id: product.id },
                data: { imageUrl: imageUrl }
            });
            console.log(`  Restored: ${product.name}`);
        }
    }

    const finalMissing = await (prisma as any).product.count({
        where: { imageUrl: { contains: 'ebayimg.com' } }
    });
    console.log(`Final Result: ${459 - finalMissing} / 459 restored.`);
}

lastDitchRestoration().catch(console.error);
