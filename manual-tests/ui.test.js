const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

function fixture() {
  const answer = (n) => n === 1
    ? 'I went to the beach I found a shell My friend saw a bird We built a sandcastle'
    : Array.from({ length: n % 2 ? 6 : 4 }, (_, i) => `My family visited the park on Saturday ${i + 1}.`).join(' ');
  const cards = Array.from({ length: 8 }, (_, i) => `
    <div class="BFocEf" data-card="${i + 1}">
      <div class="vnb4ld"><div class="x8O7Bb">${answer(i + 1)}</div></div>
      <div class="row"><label>Score <input type="number" aria-label="Score awarded for this question ${i + 1}" /></label>
      <div role="button" tabindex="0" aria-label="Mark responses as correct">✓</div>
      <div role="button" tabindex="0" aria-label="Mark responses as incorrect">✕</div></div>
    </div>`).join('');
  return `<!doctype html><html><head><style>
    body {margin:0;font:16px Arial;background:#f0ecfa}
    .header {height:240px;background:#fff}
    main {width:900px;margin:0 auto}
    .BFocEf {background:#fff;border:1px solid #ddd;border-radius:12px;margin:16px 0;min-height:230px;padding:24px;box-sizing:border-box}
    .vnb4ld {font-size:18px;line-height:1.6}
    .row {display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:65px}
    .row input {width:55px}
    [role=button] {cursor:pointer}
  </style></head><body><div class="header"></div><main>${cards}</main><div style="height:400px"></div>
  <div role="button" aria-label="Save grades">Save</div></body></html>`;
}

test('small-screen panel stays clear of the selected scoring field, annotates review and responds to native controls', async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 650 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setContent(fixture());
    await page.evaluate(() => {
      const saved = {};
      window.chrome = { storage: { local: {
        get: (_key, callback) => callback(saved),
        set: (obj) => Object.assign(saved, obj)
      } } };
      window.SentenceConfetti = () => {};
    });
    await page.addScriptTag({ path: path.join(__dirname, '../grader.js') });
    await page.addScriptTag({ path: path.join(__dirname, '../content.js') });
    const root = page.locator('#sentence-grader-root');
    await root.locator('.trigger').click();
    assert.match(await page.locator('[data-card="2"] .sentence-grader-count').innerText(), /4 sentences/);
    await root.locator('[data-action="next"]').click();
    await page.waitForTimeout(950);
    const score = await page.locator('[data-card="1"] input').boundingBox();
    const panel = await root.locator('.panel').boundingBox();
    assert.ok(score && panel, 'score and panel should be visible');
    assert.ok(panel.y > score.y + score.height, `panel top ${panel.y} should be below score bottom ${score.y + score.height}`);
    assert.ok(await root.locator('.review-squiggle').count() > 0, 'ambiguous text receives an underline');

    await page.locator('[data-card="2"] [aria-label="Mark responses as incorrect"]').click();
    await page.waitForTimeout(450);
    assert.ok(await root.locator('.toast').count() > 0, 'native incorrect control triggers a toast');
    await page.locator('[data-card="2"] input').fill('0');
    await page.locator('[data-card="2"] input').blur();
    await page.waitForTimeout(1100);
    assert.equal(await root.locator('[data-row-index="1"]').count(), 0, 'scored answers leave the default preview list');
    assert.deepEqual(errors, []);
    await page.close();
  } finally { await browser.close(); }
});
