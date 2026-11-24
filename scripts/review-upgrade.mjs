import {chromium} from '/Users/penny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import path from 'node:path';
const out=path.resolve('outputs/company-upgrade-20261106');await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
async function photo(name){await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,name+'.png')})}
async function go(route,lang='zh'){await p.goto('http://127.0.0.1:4193'+route+'?lang='+lang);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200)}
async function seek(selector){await p.locator(selector).first().evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-30,behavior:'instant'}));await p.waitForTimeout(1400)}
await go('/');await photo('01-hero-zh');await seek('.ap-root');await photo('02-application');await seek('.ps-root');await photo('03-products');await seek('.mf-root');await photo('04-manufacturing');await seek('.co-root');await photo('05-company');await seek('.pt-root');await photo('06-partners');await p.locator('.pt-actions [aria-expanded]').click();await photo('07-all-partners');await p.locator('.pt-actions [aria-expanded]').click();await seek('.lit-root');await photo('08-brochure');await seek('.bc-root');await photo('09-contact-footer');
await go('/company','en');await photo('10-company-en');await go('/manufacturing');await seek('.qc-root');await photo('11-quality');await go('/contact');await photo('12-contact');
await go('/','en');await p.setViewportSize({width:1280,height:900});await photo('13-home-1280');await p.setViewportSize({width:1920,height:1080});await photo('14-home-1920');
await fs.writeFile(path.join(out,'visual-check.json'),JSON.stringify({errors},null,2));await b.close();console.log(JSON.stringify({out,errors}));
