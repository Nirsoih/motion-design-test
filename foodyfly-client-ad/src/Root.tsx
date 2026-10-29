import React from 'react';
import {Composition} from 'remotion';
import {FoodyFlyAd} from './FoodyFlyAd';
import {PhoneFilm} from './scenes/PhoneFilm';
import {Opener} from './scenes/Opener';
import {EndCard} from './scenes/EndCard';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition id="FoodyFlyAd" component={FoodyFlyAd} durationInFrames={1560} fps={30} width={1920} height={1080} />
			<Composition id="PhoneFilm" component={PhoneFilm} durationInFrames={1026} fps={30} width={1920} height={1080} />
			<Composition id="Opener" component={Opener} durationInFrames={162} fps={30} width={1920} height={1080} />
			<Composition id="EndCard" component={EndCard} durationInFrames={162} fps={30} width={1920} height={1080} />
		</>
	);
};
