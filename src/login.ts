import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.linkedin.com/login");

  console.log("👉 Log in manually, then press Enter here");

  // Give you time to log in manually
  await page.waitForTimeout(60_000);

  // Save auth state
  await context.storageState({ path: "auth.json" });

  await browser.close();
})();
