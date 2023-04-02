const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "",
});
const openai = new OpenAIApi(configuration);

const wait = (milliseconds) =>
  new Promise((res) => setTimeout(res, milliseconds));

module.exports.handler = async () => {
  const hours = new Date().getUTCHours() + 3;

  if (hours !== 8) return;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Tell me a random fact" }],
    temperature: 0.6,
    max_tokens: 100,
  });

  const message = response?.data?.choices?.[0]?.message?.content;

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
    const lines = message.split("\n");

    lines.unshift("Fact of the day:");

    const nextLine = async () => {
      await page.keyboard.down("Shift");
      await page.keyboard.press("Enter");
      await page.keyboard.up("Shift");
    };

    for (const line of lines) {
      if (line === "") {
        await nextLine();
      } else {
        await page.keyboard.type(line);
        await nextLine();
      }
    }

    await page.keyboard.press("Enter");
    await browser.close();
  } catch (e) {
    return { error: e?.message };
  }

  return { hours, message: "sent" };
};
