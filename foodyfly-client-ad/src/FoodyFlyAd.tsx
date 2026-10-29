import React from 'react';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import './lib/fonts';
import {Opener} from './scenes/Opener';
import {PhoneFilm} from './scenes/PhoneFilm';
import {EndCard} from './scenes/EndCard';
import {tw, ease} from './lib/anim';

// Fades a clip in and out at its own edges (dissolve with a touch of blur).
const Edge: React.FC<{children: React.ReactNode; fadeIn?: number; fadeOut?: number}> = ({children, fadeIn = 0, fadeOut = 0}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const end = durationInFrames / fps;
	const a = fadeIn ? tw(t, 0, fadeIn, ease.soft) : 1;
	const b = fadeOut ? 1 - tw(t, end - fadeOut, fadeOut, ease.soft) : 1;
	return <AbsoluteFill style={{opacity: a * b, filter: a * b < 1 ? `blur(${(1 - a * b) * 12}px)` : undefined}}>{children}</AbsoluteFill>;
};

// Fine film grain and a soft vignette over everything.
const Finish: React.FC = () => {
	const frame = useCurrentFrame();
	const x = (frame * 137) % 512;
	const y = (frame * 271) % 512;
	return (
		<>
			<AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,10,7,0.55)', pointerEvents: 'none'}} />
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('brand/grain.png')})`,
					backgroundPosition: `${x}px ${y}px`,
					backgroundSize: '512px 512px',
					opacity: 0.07,
					mixBlendMode: 'overlay',
				}}
			/>
		</>
	);
};

export const FoodyFlyAd: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: '#021c15'}}>
			<Sequence name="Marché (HyperFrames)" from={Math.round(4.8 * fps)} durationInFrames={Math.round(5.2 * fps)}>
				<Video src={staticFile('clips/lifestyle.mp4')} trimBefore={0} muted objectFit="cover" />
			</Sequence>
			<Sequence name="Ouverture velours" from={0} durationInFrames={Math.round(5.4 * fps)}>
				<Edge fadeOut={0.6}>
					<Opener />
				</Edge>
			</Sequence>
			<Sequence name="Mille envies (HyperFrames)" from={Math.round(43.6 * fps)} durationInFrames={Math.round(3.4 * fps)}>
				<Video src={staticFile('clips/lifestyle.mp4')} trimBefore={Math.round(5 * fps)} muted objectFit="cover" />
			</Sequence>
			<Sequence name="Téléphone 3D" from={Math.round(9.8 * fps)} durationInFrames={Math.round(34.2 * fps)}>
				<Edge fadeOut={0.45}>
					<PhoneFilm />
				</Edge>
			</Sequence>
			<Sequence name="Signature" from={Math.round(46.6 * fps)} durationInFrames={Math.round(5.4 * fps)}>
				<Edge fadeIn={0.5}>
					<EndCard />
				</Edge>
			</Sequence>
			<Finish />
			<Audio src={staticFile('audio/mix.wav')} />
		</AbsoluteFill>
	);
};
