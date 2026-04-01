import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function restoreImages() {
    const debugFiles = fs.readdirSync(process.cwd()).filter(f => f.startsWith('debug-') && f.endsWith('.html'));

    const slugToImage = new Map<string, string>();

    for (const file of debugFiles) {
        const filePath = path.join(process.cwd(), file);
        console.log(`Parsing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Find all images and slugs with their positions
        const imgRegex = /https:\/\/product-images\.s3\.cardmarket\.com\/[^"&? \n]+/g;
        const slugRegex = /\/en\/Pokemon\/Products\/[^/]+\/[^/]+\/([^"&? \n\/]+)/g;

        const imgs: { url: string, pos: number }[] = [];
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            imgs.push({ url: match[0], pos: match.index });
        }

        const slugs: { slug: string, pos: number }[] = [];
        while ((match = slugRegex.exec(content)) !== null) {
            slugs.push({ slug: match[1], pos: match.index });
        }

        console.log(`  Found ${imgs.length} images and ${slugs.length} slugs`);

        // For each slug, find the nearest image BEFORE it (usually within a reasonable distance)
        for (const s of slugs) {
            let bestImg = null;
            let minDist = Infinity;

            for (const i of imgs) {
                const dist = s.pos - i.pos;
                if (dist > 0 && dist < 5000) { // Reasonably close
                    if (dist < minDist) {
                        minDist = dist;
                        bestImg = i.url;
                    }
                }
            }

            if (bestImg) {
                slugToImage.set(s.slug, bestImg);
            }
        }
    }

    console.log(`Final Map size: ${slugToImage.size}`);

    const allProducts = await (prisma as any).product.findMany({
        select: { externalId: true, id: true, name: true }
    });

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

    console.log(`Successfully restored ${updatedCount} product images out of ${allProducts.length}.`);
}

restoreImages().catch(console.error);
