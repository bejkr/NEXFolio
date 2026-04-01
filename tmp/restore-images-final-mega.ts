import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function restoreImages() {
    const scraperDir = path.join(process.cwd(), '.cache', 'scraper');
    const cacheFiles = fs.existsSync(scraperDir) ? fs.readdirSync(scraperDir).filter(f => f.endsWith('.html')).map(f => path.join(scraperDir, f)) : [];
    const debugFiles = fs.readdirSync(process.cwd()).filter(f => f.startsWith('debug-') && f.endsWith('.html')).map(f => path.join(process.cwd(), f));

    const allFiles = [...cacheFiles, ...debugFiles];
    const slugToImage = new Map<string, string>();
    const nameToImage = new Map<string, string>();

    for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const imgRegex = /https:\/\/product-images\.s3\.cardmarket\.com\/[^"&? \n]+/g;
        // Robust product slug regex
        const slugRegex = /\/en\/Pokemon\/Products\/(?:Singles|Boosters|Booster-Boxes|Elite-Trainer-Boxes|Sealed-Products|Sets-Lots-Collections|Accessories|Cardmarket)\/(?:[^"&? \n\/]+\/)?([^"&? \n\/]+)/g;

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

        // Also extract based on product name text if visible in HTML (Gallery view pattern)
        // Match <h2>Name</h2> or alt="Name"
        const nameInHtmlRegex = /(?:<h[12][^>]*>|alt="|data-testid="name"[^>]*>)([^<"]+)(?:<\/h[12]>|")/g;
        while ((match = nameInHtmlRegex.exec(content)) !== null) {
            const name = match[1].trim();
            if (name.length > 5) {
                let bestImg = null;
                let minDist = Infinity;
                for (const i of imgs) {
                    const absDist = Math.abs(match.index - i.pos);
                    if (absDist < 2000) {
                        if (absDist < minDist) {
                            minDist = absDist;
                            bestImg = i.url;
                        }
                    }
                }
                if (bestImg) nameToImage.set(name.toLowerCase(), bestImg);
            }
        }
    }

    const allProducts = await (prisma as any).product.findMany({
        select: { externalId: true, id: true, name: true }
    });

    let updatedCount = 0;
    for (const product of allProducts) {
        let imageUrl = slugToImage.get(product.externalId) || nameToImage.get(product.name.toLowerCase());

        // Try fuzzy slug match (e.g. Arceus-Booster-Box matches Arceus-Booster-Box-1)
        if (!imageUrl) {
            for (const [s, img] of slugToImage.entries()) {
                if (s.startsWith(product.externalId) || product.externalId.startsWith(s)) {
                    imageUrl = img;
                    break;
                }
            }
        }

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
