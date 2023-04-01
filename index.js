const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const wait = (milliseconds) =>
  new Promise((res) => setTimeout(res, milliseconds));

module.exports.handler = async () => {
  let message;
  const hours = new Date().getUTCHours() + 3;

  if (hours === 8) {
    message = "Good morning";
  } else if (hours === 13) {
    message = "Good afternoon";
  } else if (hours === 22) {
    message = "Goodnight";
  }

  if (!message) return { hours, message: "not sent" };

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto("https://messenger.com");
    await wait(5000);
    // await page.click(
    //   '[data-testid="cookie-policy-manage-dialog-accept-button"]'
    // );
    await page.type("#email", "");
    await page.type("#pass", "");
    await page.click("#loginbutton");
    await wait(5000);
    await page.goto("https://www.messenger.com/t/2543987712293419");
    await wait(10000);
    await page.keyboard.type(message);
    await page.keyboard.press("Enter");
    await browser.close();
  } catch (e) {
    return { error: e?.message };
  }

  return { hours, message: "sent" };
};
