import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.linkedin.com/games/tango/");

  // Wait for puzzle to load
  await page.waitForTimeout(3000);

  // Take a screenshot
  await page.screenshot({ path: "assets/board.png" });

  // Example click (replace coords later)
  await page.mouse.click(500, 500);

  console.log("Ready.");

  await browser.close();
})();
