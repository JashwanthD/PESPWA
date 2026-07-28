import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[Browser Error] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[Page Error] ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.error(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
  });

  await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await browser.close();
})();
