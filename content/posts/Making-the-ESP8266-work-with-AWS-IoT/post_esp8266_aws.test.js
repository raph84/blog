const puppeteer = require("puppeteer");

describe("jest-image-snapshot usage with an image received from puppeteer", () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch();
  });

  it("Post ESP8266 AWS", async () => {
    const page = await browser.newPage();
    await page.setDefaultTimeout(0);
    const defaultViewport = {
      height: 1920,
      width: 1280,
    };

    console.log("page.goto");
    await page.goto(
      "http://localhost:8000/how-to-deploy-vue-press-on-google-firebase-using-cloud-build",
      { waitUntil: "networkidle2" }
    );
    //await page.waitForFunction("window.ready");
    console.log("wait window ready");

    // Resize the viewport to screenshot elements outside of the viewport
    const bodyHandle = await page.$("body");
    const boundingBox = await bodyHandle.boundingBox();
    const newViewport = {
      width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
      height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height)),
    };
    await page.setViewport(Object.assign({}, defaultViewport, newViewport));

    const image = await page.screenshot();

    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.016,
      failureThresholdType: "percent",
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});
