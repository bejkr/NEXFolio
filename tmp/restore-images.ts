import prisma from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function restoreImages() {
    const debugFiles = [
        'debug-list.html',
        'debug-list-sealed.html',
        'debug-list-sealed2.html',
        'debug-all.html',
        'debug-category.html',
        'debug-sealed.html',
        'debug-search.html'
    ];

    const slugToImage = new Map<string, string>();

    for (const file of debugFiles) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) continue;

        console.log(`Parsing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Find all images
        const imgRegex = /src=&quot;(https:\/\/product-images\.s3\.cardmarket\.com\/[^&]+)&quot;/g;
        // Find all slugs
        const slugRegex = /href="\/en\/Pokemon\/Products\/[^/]+\/[^/]+\/([^"]+)"/g;

        const imgs: string[] = [];
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            imgs.push(match[1]);
        }

        const slugs: string[] = [];
        while ((match = slugRegex.exec(content)) !== null) {
            slugs.push(match[1]);
        }

        console.log(`  Found ${imgs.length} images and ${slugs.length} slugs`);

        // Usually they are in the same order. Let's try to pair them if lengths match or use proximity.
        // Actually, if we just find ALL images and ALL slugs, we might get some mismatches.
        // Let's use a combined regex that matches the structure of a row.

        // A row starts with thumbnail and then name.
        // data-bs-title="<img src=&quot;[IMG]&quot; ...> ... <a href=".../Products/[CAT]/[EXP]/[SLUG]">
        const combinedRegex = /data-bs-title="&lt;img src=&quot;(https:\/\/product-images\.s3\.cardmarket\.com\/[^&]+)&quot;[^>]*>.*?<a href="\/en\/Pokemon\/Products\/[^/]+\/[^/]+\/([^"]+)"/g;

        let pairMatch;
        let count = 0;
        while ((pairMatch = combinedRegex.exec(content)) !== null) {
            slugToImage.set(pairMatch[2], pairMatch[1]);
            count++;
        }
        console.log(`  Extracted ${count} pairs`);
    }

    console.log(`Found ${slugToImage.size} unique product images in debug files.`);

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
            // console.log(`Restored: ${product.name}`);
        }
    }

    console.log(`Successfully restored ${updatedCount} product images.`);
}

restoreImages().catch(console.error);
