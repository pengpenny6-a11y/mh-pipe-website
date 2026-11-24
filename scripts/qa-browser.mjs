import { chromium } from '/Users/penny/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, scenes } from '../src/content.js';

// Usage: node scripts/qa-browser.mjs http://127.0.0.1:4190
// Runs only against the supplied local preview. It does not submit an inquiry.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = new URL(process.argv[2] || process.env.QA_BASE_URL || 'http://127.0.0.1:4190');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Use a local preview URL for this QA script.');
const output = resolve(project, process.env.QA_OUTPUT || 'outputs/qa-tech');
await mkdir(output, { recursive: true });
const report = { base: base.href, started: new Date().toISOString(), tests: [], consoleErrors: [], pageErrors: [], failedRequests: [], screenshots: [] };
let browser;
let context;
let page;

function observe(p) {
  p.on('console', m => { if (m.type() === 'error') report.consoleErrors.push({ url: p.url(), text: m.text() }); });
  p.on('pageerror', e => report.pageErrors.push({ url: p.url(), text: e.message }));
  p.on('requestfailed', r => report.failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
}
async function test(label, fn) {
  if(process.env.QA_FILTER&&!label.includes(process.env.QA_FILTER))return;
  const start = Date.now();
  try {
    await fn();
    report.tests.push({ label, status: 'passed', durationMs: Date.now() - start });
    console.log(`PASS ${label}`);
  } catch (e) {
    report.tests.push({ label, status: 'failed', error: e.message, durationMs: Date.now() - start });
    console.error(`FAIL ${label}: ${e.message}`);
    if (page && !page.isClosed()) {
      const file = `failure-${report.tests.length}.png`;
      await page.screenshot({ path: resolve(output, file) }).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
}
function url(path = '/', lang = 'en', extra = {}) {
  const u = new URL(path, base);
  u.searchParams.set('lang', lang);
  for (const [key, value] of Object.entries(extra)) u.searchParams.set(key, value);
  return u.href;
}
async function goto(path = '/', lang = 'en', extra = {}, target = page) {
  const response = await target.goto(url(path, lang, extra), { waitUntil: 'domcontentloaded' });
  assert(response && response.status() < 400, `Route returned ${response?.status()}`);
  await target.locator('.site-header').waitFor();
  await target.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 10000 }).catch(() => {});
  await target.locator('.boot-sequence').waitFor({state:'hidden',timeout:10000});
  await target.waitForTimeout(450);
  assert(await target.evaluate(()=>document.fonts.check('800 40px Archivo')), 'Archivo display font did not load');
}
async function overflow(target = page) {
  const sizes = await target.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert(Math.max(sizes.document, sizes.body) <= sizes.width + 1, `Horizontal overflow: ${JSON.stringify(sizes)}`);
}
async function screenshot(file, fullPage = false, target = page) {
  await target.screenshot({ path: resolve(output, file), fullPage, animations: 'disabled' });
  report.screenshots.push(file);
}
async function revealPage() {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}
async function readyScene() {
  await page.locator('.ap-current').waitFor();
  await page.waitForFunction(() => {
    const image = document.querySelector('.ap-image');
    return image?.complete && image.naturalWidth > 0;
  });
}
async function waitScale(scale) {
  await page.waitForFunction(expected => {
    const el = document.querySelector('.ap-camera');
    if (!el) return false;
    const value = getComputedStyle(el).transform;
    const actual = value === 'none' ? 1 : new DOMMatrixReadOnly(value).a;
    return Math.abs(actual - expected) < 0.025;
  }, scale, { timeout: 6000 });
}
async function closeModal() {
  await page.keyboard.press('Escape');
  await page.locator('.modal-backdrop').waitFor({ state: 'hidden' });
}

try {
  browser = await chromium.launch({
    executablePath: process.env.QA_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: process.env.QA_HEADLESS !== '0',
    args: ['--no-sandbox'],
  });
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, acceptDownloads: true });
  page = await context.newPage();
  page.setDefaultTimeout(7000);
  observe(page);

  for (const lang of ['en', 'zh']) {
    for (const route of ['/', '/products', '/applications', '/services', '/manufacturing', '/company', '/news', '/contact']) {
      await test(`Route ${route} / ${lang}`, async () => {
        await goto(route, lang);
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        assert.match(await page.title(), /MH PIPE/);
        const expectedNav = lang === 'zh' ? ['首页','解决方案','产品中心','服务体系','关于我们','新闻中心','联系我们'] : ['Home','Solutions','Products','Services','About','News','Contact'];
        assert.deepEqual((await page.locator('.site-header nav a').allTextContents()).map(s => s.trim()), expectedNav);
        if (route !== '/') assert.equal(await page.locator('.site-header nav .current').count(), 1);
        await revealPage();
        const broken = await page.locator('main img').evaluateAll(imgs => imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.currentSrc));
        assert.deepEqual(broken, [], `Broken images: ${broken.join(', ')}`);
        await overflow();
        await screenshot(`${route === '/' ? 'home' : route.slice(1)}-${lang}.png`, true);
      });
    }
  }

  await test('Language switch keeps route and scene; links preserve selected language', async () => {
    await goto('/applications', 'en', { scene: 'industry' });
    await page.locator('.language-switch').click();
    await page.waitForFunction(() => document.documentElement.lang === 'zh');
    assert.equal(new URL(page.url()).pathname, '/applications');
    assert.equal(new URL(page.url()).searchParams.get('scene'), 'industry');
    assert.equal(new URL(page.url()).searchParams.get('lang'), 'zh');
    for (const href of await page.locator('.site-header a').evaluateAll(a => a.map(e => e.href))) {
      assert.equal(new URL(href).searchParams.get('lang'), 'zh', `New-tab link loses language: ${href}`);
    }
    await page.locator('.site-header nav a[href^="/products?"]').click();
    assert.equal(new URL(page.url()).pathname, '/products');
    assert.equal(new URL(page.url()).searchParams.get('lang'), 'zh');
  });

  await test('Browser history restores the language stored in the URL', async () => {
    await goto('/', 'zh');
    await page.locator('.site-header nav a[href^="/products?"]').click();
    await page.locator('.language-switch').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.goBack();
    await page.waitForFunction(() => location.pathname === '/');
    assert.equal(new URL(page.url()).searchParams.get('lang'), 'zh');
    await page.waitForFunction(() => document.documentElement.lang === 'zh', null, { timeout: 2000 });
  });

  await test('Product detail, focus containment, adding and persisting an inquiry', async () => {
    await goto('/', 'en');
    await page.evaluate(() => localStorage.removeItem('mh-inquiry-v1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.ph-products').click();
    await page.locator('.ps-details').click();
    await page.locator('.product-modal .modal').waitFor();
    const title = (await page.locator('.detail-copy h2').innerText()).trim();
    assert(products.some(p => p.name.en === title), 'Product modal has an unknown product title.');
    await page.keyboard.press('Shift+Tab');
    const initialFocusContained = await page.locator('.modal').evaluate(el => el.contains(document.activeElement));
    await page.locator('.detail-copy > .button').click();
    assert.equal((await page.locator('.sn-inquiry-number').innerText()).trim(), '1');
    assert(initialFocusContained, 'Initial Shift+Tab escaped the dialog.');
    await page.locator('.modal-close').focus();
    await page.keyboard.press('Shift+Tab');
    assert(await page.locator('.modal').evaluate(el => el.contains(document.activeElement)), 'Shift+Tab escaped the dialog.');
    await page.keyboard.press('Tab');
    assert(await page.locator('.modal').evaluate(el => el.contains(document.activeElement)), 'Tab escaped the dialog.');
    await screenshot('product-detail.png');
    await closeModal();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal((await page.locator('.sn-inquiry-number').innerText()).trim(), '1');
  });

  await test('Inquiry editing and local draft download', async () => {
    await page.locator('.inquiry-count').click();
    const item = page.locator('.inquiry-item').first();
    await item.waitFor();
    await item.locator('.small-inputs input').nth(0).fill('DN25');
    await item.locator('.small-inputs input').nth(1).fill('120');
    const form = page.locator('.inquiry-modal form');
    await form.locator('input[name="Company"]').fill('Preview QA Company');
    await form.locator('input[name="Email"]').fill('qa@example.com');
    await form.locator('input[name="Market"]').fill('Europe');
    await form.locator('textarea').fill('Please provide product drawings for the selected items.');
    const [download] = await Promise.all([page.waitForEvent('download'), form.locator('button[type="submit"]').click()]);
    const filename = resolve(output, 'MH-PIPE-inquiry.txt');
    await download.saveAs(filename);
    const text = await readFile(filename, 'utf8');
    for (const expected of ['Preview QA Company', 'qa@example.com', 'DN25', '120']) assert(text.includes(expected), `Draft omitted ${expected}`);
    assert.match(await form.innerText(), /does not send|不会自动发送/);
    await screenshot('inquiry-draft.png');
    await closeModal();
  });

  for (const [index, scene] of scenes.entries()) {
    await test(`Application ${scene.id}: image, all hotspots, zoom and reset`, async () => {
      await goto('/applications', 'en');
      await page.locator('.ap-tabs button').nth(index).click();
      await page.waitForFunction(id=>(new URL(location).searchParams.get('scene')||'industry')===id,scene.id);
      await page.waitForFunction(src=>document.querySelector('.ap-image')?.getAttribute('src')===src,scene.image);
      await readyScene();
      assert.equal(new URL(page.url()).searchParams.get('scene')||'industry', scene.id);
      assert.equal(await page.locator('.ap-image').getAttribute('src'), scene.image);
      assert.equal(await page.locator('.ap-hotspot').count(), scene.hotspots.length);
      await page.locator('.ap-stage').scrollIntoViewIfNeeded();
      const controls = page.locator('.ap-explore');
      const controlCount = await controls.count();
      if (controlCount > 1) {
        await controls.nth(1).click();
        await waitScale(1.27);
        await controls.nth(0).click();
        await waitScale(1);
      }
      for (const [hotspotIndex, hotspot] of scene.hotspots.entries()) {
        await page.locator('.ap-hotspot').nth(hotspotIndex).click();
        await page.locator('.ap-node-card').waitFor();
        await waitScale(1.65);
        const expected = products.find(p => p.id === hotspot.product).name.en;
        assert.equal((await page.locator('.ap-node-card h3').innerText()).trim(), expected);
        await screenshot(`scene-${scene.id}-hotspot-${hotspotIndex + 1}.png`);
        await page.locator('.ap-node-details').click();
        assert.equal((await page.locator('.detail-copy h2').innerText()).trim(), expected);
        await closeModal();
        await page.locator('.ap-explore').nth(0).click();
        await page.locator('.ap-node-card').waitFor({ state: 'hidden' });
        await waitScale(1);
      }
      await controls.nth(controlCount === 1 ? 0 : 2).click();
      await page.locator('.ap-node-card').waitFor();
      await page.locator('.ap-close').click();
      await page.locator('.ap-node-card').waitFor({ state: 'hidden' });
      await waitScale(1);
      await overflow();
    });
  }

  await test('Manufacturing selector without scroll jump and photograph viewer', async () => {
    await goto('/manufacturing', 'zh');
    const tabs=page.locator('.mf-selector');
    for(let index=0;index<await tabs.count();index++){
      await tabs.nth(index).click();
      await page.waitForFunction(i=>document.querySelectorAll('.mf-selector')[i]?.getAttribute('aria-pressed')==='true',index);
      await page.waitForTimeout(700);
      const active=page.locator('.mf-panel.mf-is-active');
      const src=await active.locator('img').getAttribute('src');
      await page.locator('.mf-photo-button').click();
      assert.equal(await page.locator('.photo-modal img').getAttribute('src'),src);
      if(index===0)await screenshot('manufacturing-lightbox.png');
      await closeModal();
    }
  });
  await test('Product focus selector and ring-press inquiry',async()=>{
    await goto('/products','en');
    const ids=['pipe','coupling','elbow','tee'];
    for(let i=0;i<4;i++){await page.locator('.ps-controls button').nth(i).click();assert.equal(await page.locator('.ps-object img').getAttribute('src'),'/assets/products/'+ids[i]+'.png');}
    await page.locator('#pd-tab-ring').click();await page.locator('.pd-submit').click();
    assert.match(await page.locator('.inquiry-modal textarea').inputValue(),/ring-press/i);
    await closeModal();
  });
  await test('Browser back restores language and route',async()=>{
    await goto('/','zh');await page.locator('.site-header nav a[href^="/products?"]').click();
    await page.locator('.language-switch').click();await page.goBack();
    await page.waitForFunction(()=>document.documentElement.lang==='zh');
    assert.equal(new URL(page.url()).pathname,'/');
  });
  await test('Reduced-motion preference disables autonomous hero motion', async () => {
    const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const reducedPage = await reducedContext.newPage();
    observe(reducedPage);
    try {
      await goto('/', 'en', {}, reducedPage);
      assert(await reducedPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
      await reducedPage.locator('.precision-product[data-state=ready]').waitFor();
      const before = await reducedPage.locator('.precision-product').getAttribute('data-rotation');
      await reducedPage.waitForTimeout(500);
      const after = await reducedPage.locator('.precision-product').getAttribute('data-rotation');
      assert.equal(before,after,'Hero rotated without user input under reduced motion.');
      const active = await reducedPage.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
      assert.equal(active, 0, 'CSS/Web Animations are still running under reduced motion.');
      await overflow(reducedPage);
      await screenshot('home-reduced-motion.png', false, reducedPage);
    } finally { await reducedContext.close(); }
  });

  await test('Company evidence, partner logos, brochure and contact links',async()=>{
    await goto('/company','en');
    assert.match(await page.locator('.co-intro').innerText(),/2000/);
    assert.match(await page.locator('.co-source').innerText(),/2024/);
    await page.locator('.pt-root').scrollIntoViewIfNeeded();
    await page.locator('.pt-actions [aria-expanded]').click();
    assert.equal(await page.locator('.pt-grid li').count(),20);
    assert.equal(await page.locator('.pt-grid img[alt="China Gas"]').count(),1);
    await page.locator('.pt-actions [aria-expanded]').click();
    await page.locator('.pt-play').click();
    assert.equal(await page.locator('.pt-play').getAttribute('aria-pressed'),'true');
    const doc='/downloads/minhe-company-brochure-2024-zh.pdf';
    const r=await context.request.get(new URL(doc,base).href);assert.equal(r.status(),200);assert((await r.body()).length>1000000);
    await goto('/contact','zh');
    assert.equal(await page.locator('.cd-hero-email>a').getAttribute('href'),'mailto:msmh_wj@163.com');
    assert.match(await page.locator('.cd-location').innerText(),/甘眉/);
    await page.locator('.cd-help-links>button').click();assert.equal(await page.locator('.inquiry-modal form button').count(),2);await closeModal();
  });
  await test('Quality photographs and camera reset remain continuous',async()=>{
    await goto('/manufacturing','zh');
    const qc=page.locator('.md-tabs>button');for(let i=0;i<5;i++){await qc.nth(i).click();const source=await page.locator('.md-photo img').getAttribute('src');await page.locator('.md-photo').click();assert.equal(await page.locator('.photo-modal img').getAttribute('src'),source);await closeModal();}
    await goto('/applications','en');await readyScene();await page.locator('.ap-hotspot').first().click();await waitScale(1.65);await page.locator('.ap-close').click();
    await page.waitForTimeout(70);const scale=await page.locator('.ap-camera').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).a);assert(scale>1.45,'Camera reset snapped instead of animating');await waitScale(1);
    assert.equal(await page.evaluate(()=>window.ScrollTrigger.getAll().filter(t=>t.pin).length),0);
  });
  await test('No browser console or uncaught JavaScript errors', async () => {
    assert.deepEqual(report.pageErrors, [], 'Uncaught JavaScript errors recorded.');
    assert.deepEqual(report.consoleErrors, [], 'Browser console errors recorded.');
  });
} catch (error) {
  report.tests.push({ label: 'QA runner', status: 'failed', error: error.stack || error.message });
} finally {
  await browser?.close();
  report.completed = new Date().toISOString();
  report.passed = report.tests.filter(t => t.status === 'passed').length;
  report.failed = report.tests.filter(t => t.status === 'failed').length;
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(resolve(output, 'report.txt'), [
    `MH PIPE browser QA — ${report.passed} passed, ${report.failed} failed`,
    `Preview: ${base.href}`,
    ...report.tests.map(t => `${t.status.toUpperCase()} ${t.label}${t.error ? '\n  ' + t.error : ''}`),
    `Console errors: ${report.consoleErrors.length}; page errors: ${report.pageErrors.length}; failed requests: ${report.failedRequests.length}`,
    `Screenshots: ${report.screenshots.length}`,
  ].join('\n'));
  console.log(`Report: ${resolve(output, 'report.json')}`);
  if (report.failed) process.exitCode = 1;
}
