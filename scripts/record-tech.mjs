import {chromium} from '/Users/penny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const run=promisify(execFile);const out=path.resolve('outputs/tech-motion');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});const page=await context.newPage();
const client=await context.newCDPSession(page);const frames=[];const pending=[];
client.on('Page.screencastFrame',e=>{const file='frame-'+String(frames.length).padStart(5,'0')+'.jpg';frames.push({file,time:e.metadata.timestamp});pending.push(fs.writeFile(path.join(out,file),Buffer.from(e.data,'base64')));client.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
await client.send('Page.startScreencast',{format:'jpeg',quality:80,maxWidth:1440,maxHeight:900,everyNthFrame:2});
const wait=ms=>page.waitForTimeout(ms);
async function to(selector,offset=0,duration=1100){const target=await page.locator(selector).first().evaluate((el,o)=>el.getBoundingClientRect().top+scrollY+o,offset);await page.evaluate(async({target,duration})=>{const from=scrollY,start=performance.now();await new Promise(resolve=>{const tick=now=>{const f=Math.min(1,(now-start)/duration);const q=f<.5?4*f*f*f:1-Math.pow(-2*f+2,3)/2;scrollTo(0,from+(target-from)*q);if(f<1)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)})},{target,duration});await wait(450)}
await page.goto('http://127.0.0.1:4193/?lang=en');await page.evaluate(()=>document.fonts.ready);await wait(1800);
await to('.mf-root',-60,1300);await wait(700);await to('.mf-frame',490,1800);await wait(900);
await to('.ps-root',-30,1200);await wait(600);await page.locator('.ps-controls button').nth(2).click();await wait(900);await page.locator('.ps-details').click();await wait(1200);await page.keyboard.press('Escape');await wait(350);
await to('.ap-root',-25,1100);await wait(700);await page.locator('.ap-tabs button').nth(4).click();await wait(1300);await page.locator('.ap-hotspot').first().click();await wait(1200);await page.locator('.ap-close').click();await wait(650);
await to('.ct-root',-80,1300);await wait(1300);await client.send('Page.stopScreencast');await Promise.all(pending);await browser.close();
const lines=['ffconcat version 1.0'];for(let i=0;i<frames.length;i++){lines.push("file '"+frames[i].file+"'");const dt=i+1<frames.length?Math.max(.016,Math.min(2.5,frames[i+1].time-frames[i].time)):1;lines.push('duration '+dt.toFixed(5));}lines.push("file '"+frames.at(-1).file+"'");await fs.writeFile(path.join(out,'frames.ffconcat'),lines.join('\n'));
await run('/Users/penny/Documents/Codex/2026-10-14/ji/work/video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1',['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',path.join(out,'frames.ffconcat'),'-vf','scale=1280:-2','-fps_mode','vfr','-c:v','libx264','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'MH-PIPE-motion-preview.mp4')]);console.log(JSON.stringify({video:path.join(out,'MH-PIPE-motion-preview.mp4'),frames:frames.length}));
