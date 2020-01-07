const puppeteer = require('puppeteer-core');

const touchAllOptions = async (page) => {
  // select and unselect all the options
  let buttons = (await page.$$('button[role=option]:not([data-choice=write-in])'))
  buttons = buttons.slice(0, buttons.length - 2)

  for (var i = 0; i< buttons.length; i++) {
    const b = buttons[i];
    await b.tap()
    await page.waitFor(100);
    await b.tap()
    await page.waitFor(100);
  }
}

(async () => {
  const browser = await puppeteer.launch(
    {
      headless:false,
      executablePath: '/usr/bin/chromium-browser',
      args: [`--window-size=1920,1080`, '--kiosk']
    }
  );

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  });

  // start voting
  await page.goto('https://bmd.votingworks.app/#sample');
  await page.waitFor(1000);

  while(true) {
    // go forward
    for (var i=0; i<20; i++) {
      await page.tap('#next');
      await page.waitFor(100);
      await touchAllOptions(page);
    }
    
    // go all the way back
    for (var i=0; i<20; i++) {
      await page.tap('#previous');
      await page.waitFor(100);
    }
  }
  
  await page.waitFor(4000);
  await browser.close();
})();
