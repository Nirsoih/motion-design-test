import React, {useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

// Procedural studio reflections (no network HDRI) plus a soft key / rim rig.
export const StudioLights: React.FC<{keyIntensity?: number; rimColor?: string}> = ({
	keyIntensity = 2.2,
	rimColor = '#b7ef4a',
}) => {
	const {gl, scene} = useThree();
	useLayoutEffect(() => {
		gl.toneMapping = THREE.ACESFilmicToneMapping;
		gl.toneMappingExposure = 1.0;
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = env;
		return () => {
			env.dispose();
			pmrem.dispose();
		};
	}, [gl, scene]);
	return (
		<>
			<ambientLight intensity={0.25} />
			<directionalLight position={[2.5, 3, 4]} intensity={keyIntensity} />
			<directionalLight position={[-3, 1.5, -2]} intensity={1.4} color={rimColor} />
			<directionalLight position={[0, -3, 2]} intensity={0.35} color="#9fd8c0" />
		</>
	);
};
