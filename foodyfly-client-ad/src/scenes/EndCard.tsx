import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Velvet} from './Velvet';
import {DrawNow} from '../lib/textures';
import {Reveal} from './Type';
import {C, SERIF} from '../lib/fonts';
import {spring, tw, ease} from '../lib/anim';

const layer: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%'};

// Soft steam: blurred plumes drifting upward behind the mark.
const Steam: React.FC<{t: number}> = ({t}) => (
	<>
		{[0, 1, 2, 3, 4].map((i) => {
			const life = ((t * 0.32 + i * 0.21) % 1 + 1) % 1;
			const x = 960 + Math.sin(i * 2.1 + t * 0.5) * 120 + (i - 2) * 70;
			const y = 640 - life * 520;
			const s = 180 + life * 260;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x - s / 2,
						top: y - s / 2,
						width: s,
						height: s * 1.3,
						borderRadius: '50%',
						background: 'radial-gradient(ellipse, rgba(220,245,232,0.22) 0%, rgba(220,245,232,0) 70%)',
						filter: 'blur(30px)',
						opacity: Math.sin(Math.PI * life) * tw(t, 0.6, 1.2),
					}}
				/>
			);
		})}
	</>
);

export const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const end = durationInFrames / fps;
	const pot = spring(t, 0.15, 0.9, 0.86);
	const lid = spring(t, 0.45, 0.85, 0.7);
	const s1 = spring(t, 0.8, 0.8);
	const s2 = spring(t, 0.92, 0.8);
	const wm = tw(t, 1.25, 0.9, ease.out);
	const fadeOut = tw(t, end - 0.7, 0.7, ease.inOut);
	return (
		<AbsoluteFill style={{background: '#010f0b'}}>
			<AbsoluteFill style={{opacity: tw(t, 0, 0.9, ease.soft) * 0.75}}>
				<ThreeCanvas width={width} height={height} camera={{fov: 35, position: [0.1, -0.1, 2.3]}} gl={{antialias: true}}>
					<directionalLight position={[-5, 1.2, 0.5]} intensity={5} color="#e8fff4" />
					<directionalLight position={[4, -0.6, 0.35]} intensity={1.6} color={C.lime} />
					<ambientLight intensity={0.04} />
					<group rotation={[-0.35, 0.05, 0.2]}>
						<Velvet t={t + 11} color="#0b4434" sheen="#58c99a" />
					</group>
					<DrawNow />
				</ThreeCanvas>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 60% at 50% 45%, rgba(3,46,35,0.25) 0%, rgba(1,15,11,0.92) 100%)'}} />
			<Steam t={t} />
			<AbsoluteFill style={{scale: `${1 + 0.04 * (t / end)}`}}>
				<div style={{position: 'absolute', left: 960 - 190, top: 170, width: 380, height: 299, filter: 'brightness(2.1) saturate(1.15)'}}>
					<div style={{...layer, overflow: 'hidden'}}>
						<Img src={staticFile('brand/mark-lines.svg')} style={{...layer, translate: `${(1 - spring(t, 0.9, 0.7)) * -260}px 0`}} />
					</div>
					<Img src={staticFile('brand/mark-pot.svg')} style={{...layer, translate: `0 ${(1 - pot) * 120}px`, opacity: Math.min(1, pot * 2)}} />
					<Img
						src={staticFile('brand/mark-steam1.svg')}
						style={{...layer, transformOrigin: '76% 46%', scale: `${s1}`, opacity: Math.min(1, s1 * 2)}}
					/>
					<Img
						src={staticFile('brand/mark-steam2.svg')}
						style={{...layer, transformOrigin: '79% 46%', scale: `${s2}`, opacity: Math.min(1, s2 * 2)}}
					/>
					<Img
						src={staticFile('brand/mark-lid.svg')}
						style={{
							...layer,
							translate: `0 ${(1 - lid) * -160}px`,
							rotate: `${(1 - lid) * -10}deg`,
							transformOrigin: '50% 45%',
							opacity: Math.min(1, lid * 2),
						}}
					/>
				</div>
				<Img
					src={staticFile('brand/wordmark.svg')}
					style={{
						position: 'absolute',
						left: 960 - 340,
						top: 500,
						width: 680,
						height: 176,
						clipPath: `inset(0 ${(1 - wm) * 100}% 0 0)`,
						filter: `blur(${(1 - wm) * 10}px)`,
						translate: `${(1 - wm) * -30}px 0`,
					}}
				/>
				<Reveal
					t={t}
					tIn={2.0}
					stagger={0.1}
					style={{position: 'absolute', left: 0, width: 1920, top: 730, textAlign: 'center', fontFamily: SERIF, fontSize: 92, color: '#fff'}}
					words={[{text: 'Votre'}, {text: 'repas,'}, {text: 'livré'}, {text: 'avec soin.', style: {color: C.lime, fontStyle: 'italic'}}]}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
		</AbsoluteFill>
	);
};
