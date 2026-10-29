// Renders the score stems to public/audio with headless Chromium: node audio/render-score.cjs
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	page.on('pageerror', (e) => console.error(e.message));
	await page.goto('file://' + path.join(__dirname, 'score.html'));
	const stems = await page.evaluate(() => window.renderStems());
	const out = path.join(__dirname, '..', 'public', 'audio');
	for (const [name, b64] of Object.entries(stems)) {
		fs.writeFileSync(path.join(out, `${name}.wav`), Buffer.from(b64, 'base64'));
		console.log('wrote', name);
	}
	await browser.close();
})();
