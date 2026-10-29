import React, {useMemo} from 'react';
import * as THREE from 'three';

// A draped velvet surface whose folds drift with time `t` (seconds).
export const Velvet: React.FC<{t: number; color?: string; sheen?: string}> = ({
	t,
	color = '#0a3a2c',
	sheen = '#6fdcae',
}) => {
	const geo = useMemo(() => new THREE.PlaneGeometry(7, 4.2, 280, 170), []);
	const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
	const mat = useMemo(
		() =>
			new THREE.MeshPhysicalMaterial({
				color,
				roughness: 0.78,
				metalness: 0,
				sheen: 1,
				sheenColor: new THREE.Color(sheen),
				sheenRoughness: 0.45,
				envMapIntensity: 0.04,
			}),
		[color, sheen],
	);

	const pos = geo.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		const x = base[i * 3];
		const y = base[i * 3 + 1];
		const h =
			0.24 * Math.sin(1.55 * x + 0.85 * y + 0.32 * t) +
			0.12 * Math.sin(2.9 * x - 1.25 * y + 0.47 * t + 1.2) +
			0.06 * Math.sin(0.75 * x + 2.3 * y - 0.26 * t + 0.4) +
			0.025 * Math.sin(5.2 * x + 2.8 * y + 0.7 * t);
		pos.setZ(i, h);
	}
	pos.needsUpdate = true;
	geo.computeVertexNormals();

	return <mesh geometry={geo} material={mat} />;
};
