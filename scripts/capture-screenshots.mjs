import puppeteer from 'puppeteer-core';
import { mkdir } from 'fs/promises';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'https://yuri-spa-beauty.vercel.app';

const IPHONE_VIEWPORT = { width: 428, height: 926, deviceScaleFactor: 3 };
const IPAD_VIEWPORT = { width: 1024, height: 1366, deviceScaleFactor: 2 };

const pages = [
  { name: '01_home', path: '/m' },
  { name: '02_services', path: '/m/dich-vu' },
  { name: '03_explore', path: '/m/kham-pha' },
  { name: '04_login', path: '/m/dang-nhap' },
  { name: '05_contact', path: '/lien-he' },
];

async function capture(viewport, outDir) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport(viewport);

  for (const p of pages) {
    const url = `${BASE_URL}${p.path}`;
    console.log(`  → ${p.name}: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({
      path: `${outDir}/${p.name}.png`,
      fullPage: false,
    });
    console.log(`  ✅ saved (${page.url()})`);
  }
  await browser.close();
}

async function main() {
  const iphoneDir = '/Users/mac/Desktop/appstore_screenshots/iphone65_real';
  const ipadDir = '/Users/mac/Desktop/appstore_screenshots/ipad_real';
  await mkdir(iphoneDir, { recursive: true });
  await mkdir(ipadDir, { recursive: true });

  console.log('📱 iPhone 6.5"...');
  await capture(IPHONE_VIEWPORT, iphoneDir);
  console.log('\n📱 iPad 13"...');
  await capture(IPAD_VIEWPORT, ipadDir);
  console.log('\n🎉 Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
