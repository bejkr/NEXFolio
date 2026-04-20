import puppeteer from 'puppeteer';
import { readFileSync, unlinkSync } from 'fs';

const cookieFile = 'scripts/.tmp-cookie';
let cookieValue;
try {
    cookieValue = readFileSync(cookieFile, 'utf8').trim();
    unlinkSync(cookieFile);
} catch {
    console.error('Cookie file not found at scripts/.tmp-cookie');
    process.exit(1);
}

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1080 });

await page.setCookie({
    name: 'sb-lqygstfhwechgtapdmbk-auth-token',
    value: cookieValue,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
});

console.log('Navigating to dashboard...');
await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000));

await page.screenshot({
    path: 'public/dashboard-preview.jpg',
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: 1440, height: 1080 },
});

await browser.close();
console.log('Screenshot saved to public/dashboard-preview.jpg');
