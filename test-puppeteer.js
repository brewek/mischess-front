const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('RESPONSE ERROR:', response.url(), response.status());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // Click the Engine Switch to enable it
  // We need to find the Switch component. It's an input type checkbox inside the Engine control panel.
  const switchSelector = 'input[type="checkbox"]';
  const checkboxes = await page.$$(switchSelector);
  if (checkboxes.length > 0) {
    console.log('Clicking engine switch...');
    await checkboxes[0].click();
  }

  await new Promise(r => setTimeout(r, 4000));
  
  const content = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  if (content.includes('M1') || content.includes('1. e4')) {
    console.log('Found engine output in DOM');
  } else {
    console.log('Engine output not found');
  }

  await browser.close();
})();
