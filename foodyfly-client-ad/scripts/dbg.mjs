import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const chromiumOptions = {gl: 'swangle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: true});
const composition = await selectComposition({serveUrl, id: 'PhoneFilm', browserExecutable, chromiumOptions});
for (const s of [2.0, 3.0, 3.7, 5.0]) {
  await renderStill({composition, serveUrl, frame: Math.round(s*30), output: '/tmp/claude-0/-home-user-motion-design-test/9837acf6-23fe-530a-a5c9-229d14d04281/scratchpad/dbg.png', scale: 0.25, browserExecutable, chromiumOptions,
    onBrowserLog: (l) => { if (l.text.includes('DBG')) console.log(l.text); }, overwrite: true});
}
