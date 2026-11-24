import {chromium} from '/Users/penny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {scenes} from '../src/content.js';

const run=promisify(execFile);
const out=path.resolve('outputs/precision-home/recording');
const ffmpeg='/Users/penny/Documents/Codex/2026-10-14/ji/work/video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage(),errors=[],steps=[],frames=[],pending=[];
page.on('pageerror',e=>errors.push(e.message));
const wait=ms=>page.waitForTimeout(ms);
await page.goto('http://127.0.0.1:4193/?lang=zh',{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
await page.waitForFunction(()=>document.querySelector('.precision-product')?.dataset.renderer==='webgl');
await page.evaluate(async more=>{await Promise.all([...document.querySelectorAll('main img')].map(el=>el.src).concat(more).map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{})}))},[...scenes.map(s=>s.image),'/assets/scenes/water-building.png']);
await wait(1200);
const client=await context.newCDPSession(page);
client.on('Page.screencastFrame',e=>{
  const file='frame-'+String(frames.length).padStart(5,'0')+'.jpg';
  frames.push({file,time:e.metadata.timestamp});
  pending.push(fs.writeFile(path.join(out,file),Buffer.from(e.data,'base64')));
  client.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});
});
const started=Date.now();
const mark=name=>{steps.push({name,seconds:(Date.now()-started)/1000});console.log(name)};
await client.send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:1440,maxHeight:1000,everyNthFrame:2});
async function to(selector,offset=-30,duration=1200){
  await page.evaluate(({selector,offset,duration})=>new Promise(resolve=>{
    const target=document.querySelector(selector).getBoundingClientRect().top+scrollY+offset;
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    if(window.mhScroll) window.mhScroll.scrollTo(target,{duration:duration/1000,lerp:0,easing:ease,onComplete:resolve});
    else {window.scrollTo({top:target,behavior:'smooth'});setTimeout(resolve,duration)}
    setTimeout(resolve,duration+500);
  }),{selector,offset,duration});
  await wait(160);
}
async function move(x,y,duration=450,segments=22){
  // Browser input moves are spaced in wall time so the film captures a real,
  // comfortably paced pointer gesture rather than one burst of events.
  const point=await page.evaluate(()=>window.__recordPointer||{x:720,y:500});
  for(let i=1;i<=segments;i++){const t=i/segments;await page.mouse.move(point.x+(x-point.x)*t,point.y+(y-point.y)*t);await wait(duration/segments)}
  await page.evaluate(({x,y})=>{window.__recordPointer={x,y}},{x,y});
}
await page.mouse.move(720,500);await page.evaluate(()=>{window.__recordPointer={x:720,y:500}});
await wait(1400);mark('Hero / polished live WebGL material');
const product=await page.locator('.precision-product').boundingBox();
await move(product.x+product.width*.57,product.y+product.height*.57,300);
await page.mouse.down();await move(product.x+product.width*.57+140,product.y+product.height*.57,1050,35);await page.mouse.up();await wait(600);
mark('Direct product rotation');
mark('Complete connection assembly shown by default');
await page.locator('.precision-product').focus();await page.keyboard.press('Home');await wait(650);
mark('Keyboard restores the home view');
await to('.pa-root',-25,1300);await wait(400);
await page.locator('.pa-tabs button').nth(4).click();await wait(1150);
await page.locator('.pa-tabs button').nth(0).click();await wait(1200);
mark('Applications / cooling and building water');
await page.locator('.pa-node').first().click();await wait(1450);
await page.locator('.pa-view-action').click();await wait(1150);
mark('Connection camera and full-view return');
await to('.pm-root',-25,1300);await move(1410,70,250);await wait(2100);
mark('Factory rendering and source-qualified figures');
await to('.pm-metrics',-80,1000);await wait(1000);
const film=await page.locator('.pm-film').boundingBox();
await move(film.x+film.width*.15,film.y+film.height*.5,350);await wait(700);
await move(film.x+film.width*.64,film.y+film.height*.5,450);await wait(700);
await move(film.x+film.width*.90,film.y+film.height*.5,450);await wait(700);
await move(1410,80,250);await wait(450);
mark('Factory photo filmstrip / material, forming and inspection');
await to('.pt-root',-65,1300);await move(1420,60,250);await wait(5200);
mark('Moving partner logos and contact entry');
await page.screenshot({path:path.join(out,'last-screen.png')});
await client.send('Page.stopScreencast');await Promise.all(pending);
await browser.close();
if(!frames.length)throw new Error('No browser frames recorded');
const lines=['ffconcat version 1.0'];let duration=0;
for(let i=0;i<frames.length;i++){
  lines.push("file '"+frames[i].file+"'");
  const dt=i+1<frames.length?Math.max(.008,Math.min(10,frames[i+1].time-frames[i].time)):.7;
  duration+=dt;lines.push('duration '+dt.toFixed(5));
}
lines.push("file '"+frames.at(-1).file+"'");
await fs.writeFile(path.join(out,'frames.ffconcat'),lines.join('\n'));
const video=path.join(out,'MH-PIPE-precision-home.mp4');
await run(ffmpeg,['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',path.join(out,'frames.ffconcat'),'-vf','scale=1440:-2','-fps_mode','vfr','-c:v','libx264','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',video]);
await run(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',video,'-vf',`fps=${12/duration},scale=360:-1,tile=4x3`,'-frames:v','1',path.join(out,'contact-sheet.jpg')]);
await fs.copyFile(path.join(out,frames[0].file),path.join(out,'first-frame.jpg'));
await fs.copyFile(path.join(out,frames.at(-1).file),path.join(out,'last-frame.jpg'));
const metadata={video,viewport:{width:1440,height:1000},durationSeconds:duration,bytes:(await fs.stat(video)).size,frames:frames.length,errors,steps,firstFrame:frames[0].file,lastFrame:frames.at(-1).file,source:'Actual local browser capture; no generated or composited video frames.'};
await fs.writeFile(path.join(out,'recording.json'),JSON.stringify(metadata,null,2));
console.log(JSON.stringify(metadata));
