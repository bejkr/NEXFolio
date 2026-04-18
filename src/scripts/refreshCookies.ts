import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const COOKIES_FILE = path.join(process.cwd(), '.cardmarket-cookies.txt');
const UA_FILE = path.join(process.cwd(), '.cardmarket-ua.txt');
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const BRAVE_USER_DATA = `C:\\Users\\${require('os').userInfo().username}\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data`;

async function main() {
    console.log('🍪 Refreshing Cardmarket cookies...');
    console.log('   Close Brave before running this script!\n');

    const fs2 = require('fs');
    const executablePath = fs2.existsSync(BRAVE_PATH) ? BRAVE_PATH : undefined;
    const userDataDir = executablePath && fs2.existsSync(BRAVE_USER_DATA) ? BRAVE_USER_DATA : undefined;

    const browser = await puppeteer.launch({
        headless: false,
        executablePath,
        userDataDir,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log('   Navigating to Cardmarket...');
    await page.goto('https://www.cardmarket.com/en/Pokemon', { waitUntil: 'domcontentloaded', timeout: 90000 });

    // Wait for CF challenge to pass
    const pageTitle = await page.title();
    if (pageTitle.includes('Just a moment')) {
        console.log('   Cloudflare detected — waiting for auto-pass (up to 60s)...');
        await page.waitForFunction(
            () => !document.title.includes('Just a moment'),
            { timeout: 60000 }
        );
        await new Promise(r => setTimeout(r, 2000));
    }

    // Extract all cookies
    const cookies = await page.cookies();
    const cookieString = cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');

    // Get the real User-Agent from the browser
    const realUA = await page.evaluate(() => navigator.userAgent);

    fs.writeFileSync(COOKIES_FILE, cookieString);
    fs.writeFileSync(UA_FILE, realUA);

    const cfCookie = cookies.find(c => c.name === 'cf_clearance');
    const phpSession = cookies.find(c => c.name === 'PHPSESSID');

    console.log(`\n✅ Cookies saved to ${COOKIES_FILE}`);
    console.log(`   cf_clearance: ${cfCookie ? '✓' : '✗ missing!'}`);
    console.log(`   PHPSESSID:    ${phpSession ? '✓' : '✗ missing!'}`);
    console.log(`   Total cookies: ${cookies.length}`);
    console.log(`   User-Agent: ${realUA}`);
    console.log('\n   You can now run: npm run sync:cardmarket:prices');

    await browser.close();
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
