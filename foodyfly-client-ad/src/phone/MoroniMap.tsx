import React, {useMemo} from 'react';
import * as THREE from 'three';

const SIZE = 5.2; // world units
// Route on the map, in 0..1 map coordinates (Le Jasmin → Coulée).
const ROUTE: [number, number][] = [
	[0.27, 0.66],
	[0.4, 0.66],
	[0.4, 0.5],
	[0.6, 0.5],
	[0.6, 0.34],
	[0.74, 0.34],
];
const toWorld = ([u, v]: [number, number], y = 0) => new THREE.Vector3((u - 0.5) * SIZE, y, (v - 0.5) * SIZE);

const drawMap = () => {
	const N = 4096;
	const c = document.createElement('canvas');
	c.width = N;
	c.height = N;
	const g = c.getContext('2d')!;
	let seed = 11;
	const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	g.fillStyle = '#021f18';
	g.fillRect(0, 0, N, N);
	// sea to the west
	g.fillStyle = '#021a14';
	g.beginPath();
	g.moveTo(0, 0);
	g.lineTo(N * 0.13, 0);
	for (let y = 0; y <= N; y += 128) g.lineTo(N * (0.11 + 0.03 * Math.sin(y / 600) + 0.015 * Math.sin(y / 170)), y);
	g.lineTo(0, N);
	g.closePath();
	g.fill();
	// blocks
	const cols = [0.16, 0.25, 0.33, 0.4, 0.5, 0.6, 0.68, 0.77, 0.86, 0.95, 1.05];
	const rows = [-0.05, 0.06, 0.16, 0.25, 0.34, 0.42, 0.5, 0.58, 0.66, 0.75, 0.84, 0.93, 1.05];
	for (let i = 0; i < cols.length - 1; i++) {
		for (let j = 0; j < rows.length - 1; j++) {
			const x0 = cols[i] * N + 26;
			const x1 = cols[i + 1] * N - 26;
			const y0 = rows[j] * N + 26;
			const y1 = rows[j + 1] * N - 26;
			const shade = 0.5 + rnd() * 0.5;
			g.fillStyle = `rgba(10, 66, 50, ${0.22 + 0.22 * shade})`;
			g.beginPath();
			g.roundRect(x0, y0, x1 - x0, y1 - y0, 28);
			g.fill();
			// a few building footprints
			g.fillStyle = 'rgba(18, 90, 68, 0.38)';
			for (let k = 0; k < 4; k++) {
				const bw = (x1 - x0) * (0.18 + rnd() * 0.22);
				const bh = (y1 - y0) * (0.18 + rnd() * 0.22);
				g.fillRect(x0 + rnd() * (x1 - x0 - bw), y0 + rnd() * (y1 - y0 - bh), bw, bh);
			}
		}
	}
	// streets
	g.strokeStyle = 'rgba(64, 150, 118, 0.3)';
	g.lineWidth = 10;
	cols.forEach((x) => {
		g.beginPath();
		g.moveTo(x * N, 0);
		g.lineTo(x * N, N);
		g.stroke();
	});
	rows.forEach((y) => {
		g.beginPath();
		g.moveTo(N * 0.14, y * N);
		g.lineTo(N, y * N);
		g.stroke();
	});
	// coastal road
	g.strokeStyle = 'rgba(110, 200, 160, 0.6)';
	g.lineWidth = 16;
	g.beginPath();
	for (let y = 0; y <= N; y += 64) g.lineTo(N * (0.145 + 0.03 * Math.sin(y / 600) + 0.015 * Math.sin(y / 170)), y);
	g.stroke();
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 16;
	return t;
};

const buildPath = () => {
	const path = new THREE.CurvePath<THREE.Vector3>();
	for (let i = 1; i < ROUTE.length; i++) path.add(new THREE.LineCurve3(toWorld(ROUTE[i - 1], 0.012), toWorld(ROUTE[i], 0.012)));
	return path;
};

// Dark 3D map of Moroni with the route drawn in lime. draw: 0→1 route length, rider: 0→1 position, opacity: fade.
export const MoroniMap: React.FC<{opacity: number; draw: number; rider: number}> = ({opacity, draw, rider}) => {
	const tex = useMemo(drawMap, []);
	const path = useMemo(buildPath, []);
	const segs = 600;
	const core = useMemo(() => new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, segs, 0.014, 12, false), [path]);
	const glow = useMemo(() => new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, segs, 0.05, 12, false), [path]);
	const mats = useMemo(
		() => ({
			map: new THREE.MeshStandardMaterial({map: tex, roughness: 0.85, metalness: 0.0, transparent: true}),
			core: new THREE.MeshBasicMaterial({color: '#c9ff5c', toneMapped: false, transparent: true}),
			glow: new THREE.MeshBasicMaterial({color: '#b7ef4a', toneMapped: false, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false}),
			rider: new THREE.MeshBasicMaterial({color: '#d8ff7a', toneMapped: false, transparent: true}),
			halo: new THREE.MeshBasicMaterial({color: '#b7ef4a', toneMapped: false, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false}),
			pin: new THREE.MeshPhysicalMaterial({color: '#0b5a43', roughness: 0.3, metalness: 0.2, clearcoat: 1, transparent: true}),
			ring: new THREE.MeshBasicMaterial({color: '#b7ef4a', toneMapped: false, transparent: true}),
			resto: new THREE.MeshPhysicalMaterial({color: '#f4f7f2', roughness: 0.4, transparent: true}),
		}),
		[tex],
	);
	if (opacity <= 0.001) return null;
	Object.values(mats).forEach((m) => {
		const base = m === mats.glow ? 0.16 : m === mats.halo ? 0.25 : 1;
		m.opacity = base * opacity;
	});
	const count = Math.floor(draw * segs) * 12 * 6;
	core.setDrawRange(0, count);
	glow.setDrawRange(0, count);
	const rp = path.getPointAt(Math.min(0.999, Math.max(0.001, rider * draw)));
	const home = toWorld(ROUTE[ROUTE.length - 1]);
	const start = toWorld(ROUTE[0]);
	return (
		<group>
			<mesh material={mats.map} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[SIZE, SIZE]} />
			</mesh>
			<mesh geometry={glow} material={mats.glow} />
			<mesh geometry={core} material={mats.core} />
			{rider > 0 ? (
				<group position={[rp.x, 0.04, rp.z]}>
					<mesh material={mats.halo}>
						<sphereGeometry args={[0.075, 32, 32]} />
					</mesh>
					<mesh material={mats.rider}>
						<sphereGeometry args={[0.032, 32, 32]} />
					</mesh>
				</group>
			) : null}
			<group position={[home.x, 0, home.z]}>
				<mesh material={mats.pin} position={[0, 0.12, 0]} rotation={[Math.PI, 0, 0]}>
					<coneGeometry args={[0.05, 0.16, 32]} />
				</mesh>
				<mesh material={mats.pin} position={[0, 0.22, 0]}>
					<sphereGeometry args={[0.06, 32, 32]} />
				</mesh>
				<mesh material={mats.ring} position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<ringGeometry args={[0.07, 0.085, 48]} />
				</mesh>
			</group>
			<group position={[start.x, 0, start.z]}>
				<mesh material={mats.resto} position={[0, 0.02, 0]}>
					<cylinderGeometry args={[0.06, 0.06, 0.04, 48]} />
				</mesh>
			</group>
		</group>
	);
};
