// Run against a default Firebase-mode export with no configured project.
const { chromium, expect } = require("@playwright/test");
const server = require("./serve.cjs");
(async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: "msedge", headless: true });
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:4173");
    await expect(
      page.getByText("Connect Firebase", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Continue as citizen", { exact: true }),
    ).toHaveCount(0);
    console.log(
      "PASS: missing Firebase config shows setup and cannot bypass authentication.",
    );
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
