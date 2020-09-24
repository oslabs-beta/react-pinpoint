const puppeteer = require("puppeteer");
const reactPinpoint = require('../react-pinpoint');

let browser, page


beforeEach(async () => {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  page = await browser.newPage();

  // If tests need different root or url then we need to put this inside the tests
  const url = "http://localhost:3000/calculator"
  const rootId = "#root"
  await reactPinpoint.recordTest(page, url, rootId)
})



afterEach(async () => {
  const slowRenders = await reactPinpoint.reportTestResults(page)
  // console.log("YEAH->", slowRenders);
  await browser.close();
})



test("999 displays", async () => {
  await page.click("#yeah9");
  await page.click("#yeah9");
  await page.click("#yeah9");

  const value = await page.evaluate(() => {
    const element = document.querySelector(".component-display>div")
    return element.textContent
  })

  expect(value).toBe("999")
})


test("666 displays", async () => {
  await page.click("#yeah6");
  await page.click("#yeah6");
  await page.click("#yeah6");

  const value = await page.evaluate(() => {
    const element = document.querySelector(".component-display>div")
    return element.textContent
  })

  expect(value).toBe("666")
})



test("Test add", async () => {
  await page.click("#yeah9");
  await page.click("#yeah\\+");
  await page.click("#yeah9");
  await page.click("#yeah\\=");

  const value = await page.evaluate(() => {
    const element = document.querySelector(".component-display>div")
    return element.textContent
  })

  expect(value).toBe("18")

})


