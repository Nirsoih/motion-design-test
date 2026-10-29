// Renders review stills: node scripts/stills.mjs <outDir> <seconds,comma,separated> [composition] [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, secs, id = 'FoodyFlyAd', scale = '0.5'] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: true});
const composition = await selectComposition({serveUrl, id, browserExecutable, chromiumOptions});
for (const s of secs.split(',').map(Number)) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
	const output = path.join(outDir, `${id}_${String(s.toFixed(2)).padStart(6, '0')}.png`);
	await renderStill({composition, serveUrl, frame, output, scale: Number(scale), browserExecutable, chromiumOptions});
	console.log(output);
}
