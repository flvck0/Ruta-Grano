const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:8082/login", { waitUntil: "networkidle2" });
  const el = await page.evaluate(() => {
    const el = document.elementFromPoint(500, 690);
    return el ? el.outerHTML : 'none';
  });
  console.log("Element at 500,690:", el);
  await browser.close();
})();
