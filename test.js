const puppeteer = require('puppeteer-core');
const { exec } = require('child_process');

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

const resetCard = async (page) => {
  await exec('cd ../module-smartcards; pipenv run python mockCardReader.py enable');
  await page.waitFor(1000);
  await exec('cd ../module-smartcards; pipenv run python writeVoterCardNoMockOverHTTP.py');
  await page.waitFor(1000);  
  await exec('cd ../module-smartcards; pipenv run python mockCardReader.py disable');
  await page.waitFor(1000);  
};

const stopMockingCard = async () => {
  await exec('cd ../module-smartcards; pipenv run python mockCardReader.py disable');
}

(async () => {
  const browser = await puppeteer.launch(
    {
      headless:false,
      executablePath: '/usr/bin/chromium-browser',
      args: [`--window-size=1920,1080`, '--kiosk'],
      userDataDir: "/home/parallels/.config/chromium"
    }
  );

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  });

  await resetCard(page);

  console.log("YES");
  
  // start voting
  await page.goto('http://localhost:3000');
  await page.waitFor(1000);

  while(true) {
    // go forward
    for (var i=0; i<20; i++) {
      await page.tap('#next');
      await page.waitFor(100);
      await touchAllOptions(page);
    }

    // go to review screen
    await page.tap('#next');
    await page.waitFor(100);
    await page.tap('#next');
    await page.waitFor(100);
    await page.tap('#next');

    await page.waitFor(3000);

    await resetCard(page);
  }
  
  await page.waitFor(4000);
  await browser.close();
})();
