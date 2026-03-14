#!/usr/bin/env tsx

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the UI
  await page.goto('http://localhost:3000');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Click on Build Tracking tab
  const trackingTab = page.locator('button:has-text("Build Tracking")');
  if (await trackingTab.isVisible()) {
    await trackingTab.click();
    await page.waitForTimeout(1000);
  }

  // Take screenshot
  await page.screenshot({ path: 'ui-screenshot.png', fullPage: true });

  console.log('Screenshot saved to ui-screenshot.png');

  await browser.close();
}

main().catch(console.error);
