import {chromium} from '/Users/penny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('outputs/design-opinion-20261106');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const delay=ms=>page.waitForTimeout(ms);
async function screenshot(name){await delay(700);await page.screenshot({path:path.join(out,name+'.png')})}
async function seek(selector){await page.evaluate(s=>window.scrollTo({top:document.querySelector(s).getBoundingClientRect().top+scrollY-40,behavior:'instant'}),selector);await delay(900)}
await page.goto('http://127.0.0.1:4193/?lang=en');await page.evaluate(()=>document.fonts.ready);await delay(1800);await screenshot('hero-en-final');
await page.setViewportSize({width:1440,height:1000});await delay(500);await seek('.mf-root');await screenshot('manufacturing-opening');
await page.locator('.mf-selector').nth(1).click();await delay(1500);await screenshot('manufacturing-inspection');
await seek('.ps-root');await screenshot('products-stage');await page.locator('.ps-controls button').nth(2).click();await delay(800);await screenshot('products-elbow');
await page.locator('.ps-details').click();await delay(900);await screenshot('product-modal');await page.keyboard.press('Escape');
await seek('.ap-root');await screenshot('applications-industry');await page.locator('.ap-tabs button').nth(4).click();await delay(1000);await screenshot('applications-cooling');await page.locator('.ap-hotspot').first().click();await delay(1200);await screenshot('applications-detail');await page.locator('.ap-close').click();
await seek('.ct-root');await screenshot('contact');
await page.goto('http://127.0.0.1:4193/products?lang=en');await delay(1300);await page.screenshot({path:path.join(out,'products-full.png'),fullPage:true});
await page.goto('http://127.0.0.1:4193/contact?lang=zh');await delay(1300);await page.screenshot({path:path.join(out,'contact-full.png'),fullPage:true});
await page.goto('http://127.0.0.1:4193/?lang=zh');await delay(1900);await screenshot('hero-zh-final');await seek('.ps-root');await screenshot('products-zh');
await fs.writeFile(path.join(out,'review.json'),JSON.stringify({errors,viewport:{width:1440,height:1000},font:'Archivo loaded',capturedAt:new Date().toISOString()},null,2));
console.log(JSON.stringify({output:out,errors}));await browser.close();if(errors.length)process.exitCode=1;
