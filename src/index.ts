import { chromium } from "playwright";
import { parseTangoGrid } from "./vision/parseTangoGrid";
import path from "path";
import { GridSolver } from "./solver/Grid";

(async () => {    
    // const browser = await chromium.launch({ headless: false });
    // const page = await browser.newPage();
    // await page.addInitScript(() => {
    //     Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // });

    // await page.goto("https://www.linkedin.com/games/tango/");

    // // Handle cookie consent
    // const rejectBtn = page.locator('button', { hasText: 'Reject' });
    // await rejectBtn.waitFor({ state: 'visible' });
    // await rejectBtn.click();

    // // Wait for the iframe to appear
    // const frameElement = await page.waitForSelector('iframe.game-launch-page__iframe');
    // const frame = await frameElement.contentFrame(); // switch to the iframe

    // if (!frame) {
    //     console.error("Could not access iframe!");
    //     return;
    // }

    // const startBtn = frame.locator('#launch-footer-start-button');
    // await startBtn.waitFor({ state: 'visible' });
    // await startBtn.scrollIntoViewIfNeeded();
    // await startBtn.hover();
    // await startBtn.click({ force: true });

    // // Wait for game content to load
    // await frame.getByText('How to play').waitFor({ state: 'visible' });

    // // Take a screenshot of the iframe
    // await page.screenshot({ path: 'assets/board.png' });
    // console.log("Game started and screenshot taken!");

    const fullPath = path.resolve(__dirname, "../assets/previous/board2.png");
    const { grid, symbols } = await parseTangoGrid(fullPath, true);
    console.log('Cells:', grid);
    console.log('Symbols:', JSON.stringify(symbols));

    const solver = new GridSolver(grid, symbols);
    const solvedGrid = solver.solveWithBacktracking();
    console.log('Solved Grid:', solvedGrid);

    // await browser.close();
})();
