import React, {useMemo} from 'react';
import * as THREE from 'three';
import {PHONE, SCREEN} from './Phone3D';

export type Crop = [number, number, number, number]; // x0, y0, x1, y1 as screen fractions (top-left origin)

const rounded = (w: number, h: number, r: number) => {
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

let shadowTex: THREE.Texture | null = null;
const getShadow = () => {
	if (shadowTex) return shadowTex;
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 256;
	const g = c.getContext('2d')!;
	g.filter = 'blur(28px)';
	g.fillStyle = 'rgba(0,0,0,1)';
	g.beginPath();
	g.roundRect(70, 60, 372, 136, 40);
	g.fill();
	shadowTex = new THREE.CanvasTexture(c);
	return shadowTex;
};

// A slice of the screen that lifts off the glass toward the camera (p: 0 flush → 1 lifted).
export const FloatCard: React.FC<{tex: THREE.Texture; crop: Crop; p: number; lift?: number}> = ({
	tex,
	crop,
	p,
	lift = 0.24,
}) => {
	const [x0, y0, x1, y1] = crop;
	const w = (x1 - x0) * SCREEN.w;
	const h = (y1 - y0) * SCREEN.h;
	const geo = useMemo(() => {
		const g = new THREE.ShapeGeometry(rounded(w, h, Math.min(0.03, h * 0.28)), 32);
		const pos = g.attributes.position;
		const uv = g.attributes.uv;
		for (let i = 0; i < pos.count; i++) {
			const u = pos.getX(i) / w + 0.5;
			const v = pos.getY(i) / h + 0.5;
			uv.setXY(i, x0 + u * (x1 - x0), 1 - y1 + v * (y1 - y0));
		}
		uv.needsUpdate = true;
		return g;
	}, [w, h, x0, x1, y0, y1]);
	const mat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, toneMapped: false, transparent: true}), [tex]);
	const shadowMat = useMemo(
		() => new THREE.MeshBasicMaterial({map: getShadow(), transparent: true, depthWrite: false, color: '#000'}),
		[],
	);
	if (p <= 0.001) return null;
	const cx = ((x0 + x1) / 2 - 0.5) * SCREEN.w;
	const cy = (0.5 - (y0 + y1) / 2) * SCREEN.h;
	const z = PHONE.d / 2 + 0.004 + lift * p;
	const s = 1 + 0.1 * p;
	shadowMat.opacity = 0.55 * Math.min(1, p * 1.4);
	mat.opacity = Math.min(1, p * 6);
	return (
		<group position={[cx, cy, 0]}>
			<mesh material={shadowMat} position={[0.02 * p, -0.035 * p, PHONE.d / 2 + 0.002 + lift * p * 0.35]} scale={[w * 1.25 * s, h * 2.0 * s, 1]}>
				<planeGeometry args={[1, 1]} />
			</mesh>
			<mesh geometry={geo} material={mat} position={[0, 0, z]} scale={[s, s, 1]} rotation={[0.05 * p, -0.08 * p, 0]} />
		</group>
	);
};
