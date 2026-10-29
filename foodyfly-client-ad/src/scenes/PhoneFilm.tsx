import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Phone3D, PHONE, SCREEN} from '../phone/Phone3D';
import {StudioLights} from '../phone/Studio';
import {FloatCard, Crop} from '../phone/FloatCard';
import {MoroniMap} from '../phone/MoroniMap';
import {MODE, ScreenState} from '../phone/screenMaterial';
import {useTextures, DrawNow} from '../lib/textures';
import {keys, tw, ease, spring, clamp} from '../lib/anim';
import {C, SANS} from '../lib/fonts';
import {Reveal} from './Type';

const S = (n: string) => `screens/${n}.png`;
const FILES = [
	'01-auth',
	'02-home',
	'02b-home-scroll',
	'03-restaurant',
	'04-product',
	'05-restaurant-cart',
	'06a-when-now',
	'06-when',
	'07-who',
	'07b-home-scheduled',
	'08-checkout',
	'09-tracking',
].map(S);

// Taps on the glass: [time, x, y] in screen fractions.
const TAPS: [number, number, number][] = [
	[3.2, 0.5, 0.62],
	[8.0, 0.4, 0.23],
	[11.1, 0.3, 0.8],
	[14.2, 0.72, 0.953],
	[16.4, 0.3, 0.055],
	[18.0, 0.75, 0.8],
	[21.0, 0.5, 0.965],
	[22.3, 0.5, 0.497],
	[23.8, 0.5, 0.965],
	[25.0, 0.3, 0.93],
	[28.2, 0.5, 0.977],
];

// What the glass shows at time t (seconds, scene-local).
const screenAt = (t: number): ScreenState => {
	const seg = (t0: number, d: number, e = ease.inOut) => tw(t, t0, d, e);
	if (t < 3.3) return {a: S('01-auth'), bright: tw(t, 1.9, 0.6, ease.soft)};
	if (t < 4.0) return {a: S('01-auth'), b: S('02-home'), mode: MODE.reveal, progress: seg(3.3, 0.7, ease.out), tap: [0.5, 0.62]};
	if (t < 5.6) return {a: S('02-home')};
	if (t < 7.4) return {a: S('02-home'), b: S('02b-home-scroll'), mode: MODE.scroll, progress: seg(5.6, 1.8)};
	if (t < 8.1) return {a: S('02b-home-scroll')};
	if (t < 8.9) return {a: S('02b-home-scroll'), b: S('03-restaurant'), mode: MODE.push, progress: seg(8.1, 0.8)};
	if (t < 11.3) return {a: S('03-restaurant')};
	if (t < 12.1) return {a: S('03-restaurant'), b: S('04-product'), mode: MODE.sheet, sheetTop: 0.075, progress: seg(11.3, 0.8, ease.out)};
	if (t < 14.3) return {a: S('04-product')};
	if (t < 14.9) return {a: S('05-restaurant-cart'), b: S('04-product'), mode: MODE.sheet, sheetTop: 0.075, progress: 1 - seg(14.3, 0.6)};
	if (t < 15.4) return {a: S('05-restaurant-cart')};
	if (t < 16.0) return {a: S('05-restaurant-cart'), b: S('02-home'), mode: MODE.pushBack, progress: seg(15.4, 0.6)};
	if (t < 16.5) return {a: S('02-home')};
	if (t < 17.2) return {a: S('02-home'), b: S('06a-when-now'), mode: MODE.sheet, sheetTop: 0.614, progress: seg(16.5, 0.7, ease.out)};
	if (t < 18.1) return {a: S('06a-when-now')};
	if (t < 18.8) return {a: S('06a-when-now'), b: S('06-when'), mode: MODE.sheet, sheetTop: 0.3855, progress: seg(18.1, 0.7, ease.out)};
	if (t < 21.1) return {a: S('06-when')};
	if (t < 21.8) return {a: S('06-when'), b: S('07-who'), mode: MODE.push, progress: seg(21.1, 0.7)};
	if (t < 23.9) return {a: S('07-who')};
	if (t < 24.5) return {a: S('07b-home-scheduled'), b: S('07-who'), mode: MODE.sheet, sheetTop: 0.0815, progress: 1 - seg(23.9, 0.6)};
	if (t < 25.1) return {a: S('07b-home-scheduled')};
	if (t < 25.8) return {a: S('07b-home-scheduled'), b: S('08-checkout'), mode: MODE.push, progress: seg(25.1, 0.7)};
	if (t < 28.4) return {a: S('08-checkout')};
	if (t < 29.1) return {a: S('08-checkout'), b: S('09-tracking'), mode: MODE.reveal, progress: seg(28.4, 0.7, ease.out), tap: [0.5, 0.977]};
	return {a: S('09-tracking')};
};

const tapAt = (t: number): Pick<ScreenState, 'tap' | 'tapP'> => {
	for (let i = TAPS.length - 1; i >= 0; i--) {
		const [tc, x, y] = TAPS[i];
		if (t >= tc - 0.02 && t < tc + 0.5) return {tap: [x, y], tapP: (t - tc) / 0.5};
	}
	return {tapP: -1};
};

// Floating slices: [tIn, tOut, screen, crop]
const CARDS: [number, number, string, Crop][] = [
	[9.2, 10.9, '03-restaurant', [0.03, 0.288, 0.97, 0.37]],
	[12.5, 14.0, '04-product', [0.03, 0.488, 0.97, 0.588]],
	[19.4, 20.8, '06-when', [0.035, 0.835, 0.965, 0.892]],
	[22.5, 23.6, '07-who', [0.025, 0.458, 0.975, 0.535]],
	[26.3, 27.9, '08-checkout', [0.045, 0.725, 0.955, 0.81]],
	[30.2, 32.6, '09-tracking', [0.05, 0.674, 0.95, 0.742]],
];

// Phone pose: [t, x, y, z, rx, ry, rz]
const POSE = [
	[0, 0.05, -0.15, 0.55, 0.32, -2.85, 0.18],
	[2.3, 0, 0, 0, 0.05, -0.16, 0.02],
	[28.6, 0, 0, 0, 0.04, -0.12, 0.0],
	[30.6, 0, 0.02, 0, -1.08, -0.02, 0.0],
	[34, 0, 0.04, 0, -1.12, 0.08, 0.0],
];

// Camera: [t, focus x, focus y (screen fractions), distance, yaw, pitch, shift]
// shift places the focus that far right of centre, as a fraction of the half-frame width.
const CAM = [
	[0, 0.5, 0.5, 2.6, 0.0, 0.0, 0.0],
	[2.4, 0.5, 0.5, 3.6, -0.18, 0.04, 0.0],
	[4.2, 0.5, 0.5, 3.3, -0.12, 0.02, 0.0],
	[5.2, 0.5, 0.42, 2.9, -0.2, 0.03, 0.36],
	[7.6, 0.5, 0.35, 2.6, -0.22, 0.05, 0.34],
	[8.4, 0.42, 0.28, 2.0, -0.15, 0.04, 0.05],
	[10.2, 0.5, 0.33, 1.7, -0.25, 0.06, 0.0],
	[11.4, 0.5, 0.6, 2.5, -0.1, 0.0, 0.2],
	[12.4, 0.5, 0.5, 2.7, -0.2, 0.04, 0.38],
	[13.8, 0.52, 0.6, 2.55, -0.18, 0.0, 0.36],
	[14.6, 0.62, 0.85, 1.9, -0.12, -0.05, 0.1],
	[15.4, 0.5, 0.5, 3.2, 0.1, 0.0, 0.0],
	[16.4, 0.42, 0.12, 2.1, 0.12, 0.06, 0.0],
	[17.4, 0.5, 0.7, 2.8, -0.15, -0.03, 0.36],
	[19.6, 0.5, 0.8, 2.5, -0.2, -0.05, 0.38],
	[20.9, 0.5, 0.62, 2.7, 0.05, 0.0, 0.36],
	[22.6, 0.5, 0.5, 2.55, -0.15, 0.0, 0.38],
	[23.9, 0.5, 0.5, 2.9, -0.05, 0.0, 0.2],
	[24.6, 0.5, 0.5, 3.2, 0.0, 0.0, 0.0],
	[25.2, 0.38, 0.88, 2.3, 0.15, -0.05, 0.0],
	[26.4, 0.5, 0.72, 2.6, -0.2, -0.03, 0.38],
	[27.9, 0.5, 0.8, 2.5, -0.1, -0.05, 0.3],
	[28.6, 0.5, 0.9, 2.1, 0.0, -0.08, 0.1],
	[29.4, 0.5, 0.5, 3.0, 0.0, 0.0, 0.2],
	[31.2, 0.5, 0.55, 3.9, -0.35, 0.38, 0.4],
	[34, 0.5, 0.6, 4.45, -0.5, 0.48, 0.42],
];

const tmp = new THREE.Object3D();
// Stable references: new objects each frame would make the canvas rebuild its camera.
const CAMERA = {fov: 30, near: 0.05, far: 60};
const GL = {antialias: true, alpha: true};

const Rig: React.FC<{t: number; pose: number[]}> = ({t, pose}) => {
	const {camera} = useThree();
	const [fx, fy, dist, yaw, pitch, shift] = keys(CAM, t);
	tmp.position.set(pose[0], pose[1], pose[2]);
	tmp.rotation.set(pose[3], pose[4], pose[5]);
	tmp.updateMatrixWorld(true);
	const focus = tmp.localToWorld(new THREE.Vector3((fx - 0.5) * SCREEN.w, (0.5 - fy) * SCREEN.h, PHONE.d / 2));
	const normal = new THREE.Vector3(0, 0, 1).transformDirection(tmp.matrixWorld);
	const up = new THREE.Vector3(0, 1, 0).transformDirection(tmp.matrixWorld);
	const right = new THREE.Vector3().crossVectors(up, normal).normalize();
	const dir = normal.clone().applyAxisAngle(up, yaw).applyAxisAngle(right, -pitch).normalize();
	const camPos = focus.clone().addScaledVector(dir, dist);
	// Shift camera and target sideways so the phone sits right of frame for titles.
	const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
	const lateral = shift * dist * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180) * (16 / 9);
	camPos.addScaledVector(camRight, -lateral);
	const target = focus.clone().addScaledVector(camRight, -lateral);
	camera.position.copy(camPos);
	camera.up.set(0, 1, 0);
	camera.lookAt(target);
	camera.updateProjectionMatrix();
	return null;
};

const TITLES: {tIn: number; tOut: number; eyebrow: string; title: string}[] = [
	{tIn: 5.5, tOut: 7.7, eyebrow: 'Près de vous', title: 'Moroni · Centre'},
	{tIn: 12.4, tOut: 14.1, eyebrow: 'Le Jasmin', title: 'Bowl quinoa avocat'},
	{tIn: 17.6, tOut: 20.8, eyebrow: 'Quand livrer ?', title: 'Demain · 19:15'},
	{tIn: 21.6, tOut: 23.7, eyebrow: 'Pour qui ?', title: 'Maman · Coulée'},
	{tIn: 26.0, tOut: 28.1, eyebrow: 'Payer avec MVola', title: '8 150 KMF'},
	{tIn: 30.0, tOut: 33.4, eyebrow: 'Salim est en route', title: '12 min'},
];

export const PhoneFilm: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const {textures: tex, handle} = useTextures(FILES);

	const base = keys(POSE, t);
	const settle = spring(t, 0, 2.4, 0.9);
	// entrance: spin from the back, then a slow living sway
	const pose = [
		base[0],
		base[1] + 0.012 * Math.sin(t * 0.6),
		base[2],
		base[3] + 0.018 * Math.sin(t * 0.37),
		t < 2.3 ? -2.85 + (base[4] + 2.85) * 0 + (-0.16 + 2.85) * settle : base[4] + 0.035 * Math.sin(t * 0.29),
		base[5],
	];
	// the camera frames the settled phone, so the entrance spin reads as the phone turning, not the camera
	const camPose = [pose[0], pose[1], pose[2], t < 2.3 ? 0.05 : pose[3], t < 2.3 ? -0.16 : pose[4], t < 2.3 ? 0.02 : pose[5]];
	const screen = {...screenAt(t), ...tapAt(t)};

	const mapOn = tw(t, 28.9, 1.2, ease.soft);
	const draw = tw(t, 29.6, 1.8, ease.inOut);
	const rider = tw(t, 30.9, 3.0, ease.soft) * 0.86;

	const intro = tw(t, 0, 0.8, ease.out);
	const outro = tw(t, 33.55, 0.45, ease.in);

	return (
		<AbsoluteFill style={{background: C.g950}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 60% 70% at ${62 - 12 * mapOn}% 48%, #0d5640 0%, #06402f 38%, #032e23 70%, #021c15 100%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(circle at 70% 40%, rgba(183,239,74,0.16) 0%, rgba(183,239,74,0) 32%)',
					translate: `${-60 * Math.sin(t * 0.21)}px ${40 * Math.sin(t * 0.17)}px`,
					opacity: 1 - mapOn * 0.6,
				}}
			/>
			<AbsoluteFill
				style={{
					filter: `blur(${(1 - intro) * 28 + outro * 24}px)`,
					opacity: intro,
					scale: `${1 + outro * 0.35}`,
				}}
			>
				<ThreeCanvas width={width} height={height} camera={CAMERA} gl={GL}>
					<StudioLights />
					<Rig t={t} pose={camPose} />
					{tex ? (
						<>
							<group position={[pose[0], pose[1], pose[2]]} rotation={[pose[3], pose[4], pose[5]]}>
								<Phone3D textures={tex} screen={screen} />
								{CARDS.map(([a, b, name, crop]) => {
									const p = clamp(spring(t, a, 0.9, 0.78)) * (1 - tw(t, b, 0.5, ease.inOut));
									return <FloatCard key={`${a}`} tex={tex[S(name)]} crop={crop} p={p} />;
								})}
							</group>
							<group position={[0, -0.42, -0.15]}>
								<MoroniMap opacity={mapOn} draw={draw} rider={rider} />
							</group>
						</>
					) : null}
					<DrawNow release={tex ? handle : null} />
				</ThreeCanvas>
			</AbsoluteFill>
			{TITLES.map((ti) => (
				<div key={ti.tIn} style={{position: 'absolute', left: 130, top: 420, width: 700}}>
					<Reveal
						t={t}
						tIn={ti.tIn}
						tOut={ti.tOut}
						words={[{text: ti.eyebrow.toUpperCase()}]}
						style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.18em', color: C.lime, marginBottom: 14}}
					/>
					<Reveal
						t={t}
						tIn={ti.tIn + 0.12}
						tOut={ti.tOut + 0.05}
						stagger={0.08}
						words={ti.title.replace(' · ', '\u00a0·\u00a0').split(' ').map((w) => ({text: w}))}
						style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1.0, letterSpacing: '-0.045em', color: '#fff'}}
					/>
				</div>
			))}
		</AbsoluteFill>
	);
};
