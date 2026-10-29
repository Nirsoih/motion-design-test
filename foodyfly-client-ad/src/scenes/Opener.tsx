import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Velvet} from './Velvet';
import {DrawNow} from '../lib/textures';
import {Reveal} from './Type';
import {C, SERIF} from '../lib/fonts';
import {keys, tw, ease} from '../lib/anim';

// Scene A — velvet, a question in serif.
export const Opener: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;
	const [cx, cy, cz, rx] = keys([[0, -0.25, 0.15, 2.5, 0.42], [5.2, 0.3, -0.05, 2.05, 0.3]], t, (x) => x);
	const fadeIn = tw(t, 0, 1.4, ease.soft);
	return (
		<AbsoluteFill style={{background: C.g950}}>
			<AbsoluteFill style={{opacity: fadeIn}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, position: [cx, cy, cz]}} gl={{antialias: true}}>
					<directionalLight position={[-5, 1.2, 0.5]} intensity={5.5} color="#e8fff4" />
					<directionalLight position={[4, -0.6, 0.35]} intensity={2.2} color={C.lime} />
					<ambientLight intensity={0.04} />
					<group rotation={[-rx, 0.1, -0.18]}>
						<Velvet t={t + 3} color="#0b4434" sheen="#58c99a" />
					</group>
					<DrawNow />
				</ThreeCanvas>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse at 30% 60%, rgba(3,46,35,0) 0%, rgba(3,46,35,.25) 55%, rgba(2,22,17,.85) 100%)',
				}}
			/>
			<Reveal
				t={t}
				tIn={0.75}
				tOut={4.35}
				stagger={0.16}
				lineBreakAfter={[1]}
				style={{
					position: 'absolute',
					left: 170,
					top: 380,
					fontFamily: SERIF,
					fontSize: 150,
					lineHeight: 1.0,
					color: '#fff',
					letterSpacing: '-0.01em',
				}}
				words={[{text: 'Une'}, {text: 'envie'}, {text: 'particulière ?', style: {color: C.lime, fontStyle: 'italic'}}]}
			/>
		</AbsoluteFill>
	);
};
