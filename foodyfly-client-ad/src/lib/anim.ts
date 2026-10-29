import {Easing} from 'remotion';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const ease = {
	out: Easing.bezier(0.16, 1, 0.3, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	soft: Easing.bezier(0.33, 0, 0.2, 1),
};

// Progress of a tween that starts at t0 (seconds) and lasts d seconds.
export const tw = (t: number, t0: number, d: number, e: (x: number) => number = ease.out) =>
	e(clamp((t - t0) / d));

// Critically damped-ish spring with a hint of overshoot, as a function of time.
export const spring = (t: number, t0: number, d = 0.8, z = 0.82) => {
	const x = t - t0;
	if (x <= 0) return 0;
	const w = 4.6 / (z * d);
	const wd = w * Math.sqrt(1 - z * z);
	const e = Math.exp(-z * w * x);
	return 1 - e * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
};

// Keyframes: [[time, ...values]], eased in-out between neighbours.
export const keys = (k: number[][], t: number, e: (x: number) => number = ease.inOut): number[] => {
	if (t <= k[0][0]) return k[0].slice(1);
	for (let i = 1; i < k.length; i++) {
		if (t <= k[i][0]) {
			const a = k[i - 1];
			const b = k[i];
			const p = e((t - a[0]) / (b[0] - a[0]));
			return a.slice(1).map((v, j) => lerp(v, b[j + 1], p));
		}
	}
	return k[k.length - 1].slice(1);
};

// 1 at time c, falling to 0 within w seconds on either side (press feedback).
export const pulse = (t: number, c: number, w = 0.12) => Math.max(0, 1 - Math.abs(t - c) / w);
