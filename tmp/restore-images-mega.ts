import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function restoreImages() {
    const scraperDir = path.join(process.cwd(), '.cache', 'scraper');
    const cacheFiles = fs.existsSync(scraperDir) ? fs.readdirSync(scraperDir).filter(f => f.endsWith('.html')).map(f => path.join(scraperDir, f)) : [];
    const debugFiles = fs.readdirSync(process.cwd()).filter(f => f.startsWith('debug-') && f.endsWith('.html')).map(f => path.join(process.cwd(), f));

    const allFiles = [...cacheFiles, ...debugFiles];
    const slugToImage = new Map<string, string>();

    for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const imgRegex = /https:\/\/product-images\.s3\.cardmarket\.com\/[^"&? \n]+/g;
        const slugRegex = /\/en\/Pokemon\/Products\/(?:Singles|Boosters|Booster-Boxes|Sealed-Products|Sets-Lots-Collections|Accessories|Cardmarket)\/(?:[^"&? \n\/]+\/)?([^"&? \n\/]+)/g;

        const imgs: { url: string, pos: number }[] = [];
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            imgs.push({ url: match[0], pos: match.index });
        }

        const slugs: { slug: string, pos: number }[] = [];
        while ((match = slugRegex.exec(content)) !== null) {
            slugs.push({ slug: match[1], pos: match.index });
        }

        for (const s of slugs) {
            let bestImg = null;
            let minDist = Infinity;
            for (const i of imgs) {
                const absDist = Math.abs(s.pos - i.pos);
                if (absDist < 5000) {
                    if (absDist < minDist) {
                        minDist = absDist;
                        bestImg = i.url;
                    }
                }
            }
            if (bestImg) slugToImage.set(s.slug, bestImg);
        }
    }

    const allProducts = await (prisma as any).product.findMany({
        select: { externalId: true, id: true, name: true }
    });

    const missing = allProducts.filter((p: any) => !slugToImage.has(p.externalId));
    console.log(`Missing externalIds (Sample): ${missing.slice(0, 20).map((p: any) => p.externalId).join(', ')}`);

    console.log(`Map Keys (Sample): ${Array.from(slugToImage.keys()).slice(0, 50).join(', ')}`);

    let updatedCount = 0;
    for (const product of allProducts) {
        const imageUrl = slugToImage.get(product.externalId);
        if (imageUrl) {
            await (prisma as any).product.update({
                where: { id: product.id },
                data: { imageUrl: imageUrl }
            });
            updatedCount++;
        }
    }

    console.log(`Successfully restored: ${updatedCount} / ${allProducts.length}`);
}

restoreImages().catch(console.error);
