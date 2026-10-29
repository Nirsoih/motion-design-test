import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

// Loads a set of images as sRGB textures. The returned handle stays held until
// <DrawNow> has drawn a frame that actually uses them.
export const useTextures = (files: readonly string[]) => {
	const key = files.join('|');
	const [handle] = useState(() => delayRender(`Loading textures ${key}`));
	const [textures, setTextures] = useState<Record<string, THREE.Texture> | null>(null);

	const loader = useMemo(() => new THREE.TextureLoader(), []);

	useEffect(() => {
		let cancelled = false;
		Promise.all(
			files.map(
				(f) =>
					new Promise<[string, THREE.Texture]>((resolve, reject) => {
						loader.load(
							staticFile(f),
							(t) => {
								t.colorSpace = THREE.SRGBColorSpace;
								t.anisotropy = 16;
								t.generateMipmaps = true;
								t.minFilter = THREE.LinearMipmapLinearFilter;
								t.magFilter = THREE.LinearFilter;
								resolve([f, t]);
							},
							undefined,
							reject,
						);
					}),
			),
		)
			.then((entries) => {
				if (!cancelled) setTextures(Object.fromEntries(entries));
			})
			.catch((err) => console.error(err));
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	return {textures, handle};
};

// Place last inside <ThreeCanvas>: draws the scene after every commit, so the
// captured frame always matches the current props, then releases a pending hold.
const released = new Set<number>();
export const DrawNow: React.FC<{release?: number | null}> = ({release = null}) => {
	const {advance} = useThree();
	useLayoutEffect(() => {
		advance(performance.now());
		if (release !== null && !released.has(release)) {
			released.add(release);
			continueRender(release);
		}
	});
	return null;
};
