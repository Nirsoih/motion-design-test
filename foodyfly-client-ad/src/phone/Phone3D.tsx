import React, {useMemo} from 'react';
import * as THREE from 'three';
import {makeScreenMaterial, ScreenState} from './screenMaterial';

// Proportions of a 6.1" phone, in scene units (1 unit ≈ 100 mm).
export const PHONE = {w: 0.716, h: 1.47, d: 0.083, r: 0.122};
const BEZEL = 0.026;
export const SCREEN = {w: PHONE.w - 2 * BEZEL, h: PHONE.h - 2 * BEZEL};

const roundedRect = (w: number, h: number, r: number) => {
	const s = new THREE.Shape();
	const x = -w / 2;
	const y = -h / 2;
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
	s.lineTo(x + w, y + h - r);
	s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
	s.lineTo(x + r, y + h);
	s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
	s.lineTo(x, y + r);
	s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
	return s;
};

// ShapeGeometry with UVs normalised to 0..1 across its bounding box.
const flatGeometry = (w: number, h: number, r: number) => {
	const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 64);
	const pos = g.attributes.position;
	const uv = g.attributes.uv;
	for (let i = 0; i < pos.count; i++) {
		uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
	}
	uv.needsUpdate = true;
	return g;
};

type Props = {
	textures: Record<string, THREE.Texture>;
	screen: ScreenState;
};

export const Phone3D: React.FC<Props> = ({textures, screen}) => {
	const {body, glass, screenGeo, island, bump, backGlass} = useMemo(() => {
		const bevel = 0.014;
		const bodyGeo = new THREE.ExtrudeGeometry(
			roundedRect(PHONE.w - 2 * bevel, PHONE.h - 2 * bevel, PHONE.r - bevel),
			{
				depth: PHONE.d - 2 * bevel,
				bevelEnabled: true,
				bevelThickness: bevel,
				bevelSize: bevel,
				bevelSegments: 10,
				curveSegments: 64,
			},
		);
		bodyGeo.translate(0, 0, -(PHONE.d - 2 * bevel) / 2);
		return {
			body: bodyGeo,
			glass: flatGeometry(PHONE.w - 0.012, PHONE.h - 0.012, PHONE.r - 0.006),
			screenGeo: flatGeometry(SCREEN.w, SCREEN.h, PHONE.r - BEZEL + 0.004),
			island: flatGeometry(0.19, 0.054, 0.027),
			bump: new THREE.ExtrudeGeometry(roundedRect(0.31, 0.32, 0.075), {
				depth: 0.012,
				bevelEnabled: true,
				bevelThickness: 0.004,
				bevelSize: 0.004,
				bevelSegments: 6,
				curveSegments: 32,
			}),
			backGlass: flatGeometry(PHONE.w - 0.012, PHONE.h - 0.012, PHONE.r - 0.006),
		};
	}, []);

	const mats = useMemo(
		() => ({
			frame: new THREE.MeshPhysicalMaterial({
				color: '#1d4a3b',
				metalness: 0.92,
				roughness: 0.26,
				clearcoat: 0.6,
				clearcoatRoughness: 0.2,
			}),
			glass: new THREE.MeshPhysicalMaterial({
				color: '#030605',
				metalness: 0.1,
				roughness: 0.04,
				clearcoat: 1,
				clearcoatRoughness: 0.02,
			}),
			back: new THREE.MeshPhysicalMaterial({
				color: '#24533f',
				metalness: 0.3,
				roughness: 0.42,
				clearcoat: 0.5,
				clearcoatRoughness: 0.35,
			}),
			lens: new THREE.MeshPhysicalMaterial({
				color: '#050808',
				metalness: 0.4,
				roughness: 0.05,
				clearcoat: 1,
			}),
			ring: new THREE.MeshPhysicalMaterial({color: '#2b5a49', metalness: 1, roughness: 0.18}),
			island: new THREE.MeshBasicMaterial({color: '#000000'}),
			sheen: new THREE.MeshPhysicalMaterial({
				color: '#000000',
				metalness: 1,
				roughness: 0.03,
				transparent: true,
				opacity: 0.16,
				depthWrite: false,
			}),
			screen: makeScreenMaterial(),
		}),
		[],
	);

	// Drive the screen shader from props (no self-running animation).
	const u = mats.screen.uniforms;
	u.texA.value = textures[screen.a] ?? null;
	u.texB.value = textures[screen.b ?? screen.a] ?? null;
	u.mode.value = screen.mode ?? 0;
	u.p.value = screen.progress ?? 0;
	u.sheetTop.value = screen.sheetTop ?? 0.5;
	u.scrollD.value = screen.scrollD ?? 0.616;
	u.tap.value.set(screen.tap?.[0] ?? 0.5, screen.tap?.[1] ?? 0.5);
	u.tapP.value = screen.tapP ?? -1;
	u.bright.value = screen.bright ?? 1;

	const zf = PHONE.d / 2;
	const lens = (x: number, y: number, key: string) => (
		<group key={key} position={[x, y, -zf - 0.016]} rotation={[Math.PI / 2, 0, 0]}>
			<mesh material={mats.ring}>
				<cylinderGeometry args={[0.056, 0.058, 0.018, 64]} />
			</mesh>
			<mesh position={[0, -0.0095, 0]} material={mats.lens}>
				<cylinderGeometry args={[0.045, 0.045, 0.002, 64]} />
			</mesh>
		</group>
	);

	return (
		<group>
			<mesh geometry={body} material={mats.frame} />
			<mesh geometry={glass} material={mats.glass} position={[0, 0, zf + 0.0004]} />
			<mesh geometry={screenGeo} material={mats.screen} position={[0, 0, zf + 0.0008]} />
			<mesh geometry={island} material={mats.island} position={[0, SCREEN.h / 2 - 0.042, zf + 0.0012]} />
			<mesh geometry={glass} material={mats.sheen} position={[0, 0, zf + 0.0016]} />
			{/* back */}
			<mesh geometry={backGlass} material={mats.back} position={[0, 0, -zf - 0.0004]} rotation={[0, Math.PI, 0]} />
			<mesh
				geometry={bump}
				material={mats.back}
				position={[-PHONE.w / 2 + 0.2, PHONE.h / 2 - 0.2, -zf - 0.0004]}
				rotation={[0, Math.PI, 0]}
			/>
			{lens(-PHONE.w / 2 + 0.135 + 0.0, PHONE.h / 2 - 0.135, 'l1')}
			{lens(-PHONE.w / 2 + 0.135 + 0.0, PHONE.h / 2 - 0.265, 'l2')}
			{lens(-PHONE.w / 2 + 0.262, PHONE.h / 2 - 0.2, 'l3')}
			{/* side buttons */}
			<mesh material={mats.frame} position={[PHONE.w / 2 + 0.002, 0.2, 0]}>
				<boxGeometry args={[0.01, 0.16, 0.03]} />
			</mesh>
			<mesh material={mats.frame} position={[-PHONE.w / 2 - 0.002, 0.33, 0]}>
				<boxGeometry args={[0.01, 0.1, 0.03]} />
			</mesh>
			<mesh material={mats.frame} position={[-PHONE.w / 2 - 0.002, 0.18, 0]}>
				<boxGeometry args={[0.01, 0.1, 0.03]} />
			</mesh>
		</group>
	);
};
