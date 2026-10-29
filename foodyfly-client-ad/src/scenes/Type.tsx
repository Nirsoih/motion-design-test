import React from 'react';
import {tw, ease} from '../lib/anim';

type Word = {text: string; style?: React.CSSProperties};

// Words rise out of a mask with a blur that clears; they leave upward from tOut.
export const Reveal: React.FC<{
	t: number;
	tIn: number;
	tOut?: number;
	words: Word[];
	stagger?: number;
	style?: React.CSSProperties;
	lineBreakAfter?: number[];
}> = ({t, tIn, tOut = 1e9, words, stagger = 0.09, style, lineBreakAfter = []}) => {
	return (
		<div style={style}>
			{words.map((w, i) => {
				const pin = tw(t, tIn + i * stagger, 1.1, ease.out);
				const pout = tw(t, tOut + i * 0.05, 0.6, ease.in);
				const y = (1 - pin) * 105 - pout * 105;
				const blur = (1 - pin) * 18 + pout * 18;
				return (
					<React.Fragment key={i}>
						<span style={{display: 'inline-block', overflow: 'hidden', padding: '0 0.06em 0.12em', verticalAlign: 'top'}}>
							<span
								style={{
									display: 'inline-block',
									translate: `0 ${y}%`,
									filter: `blur(${blur}px)`,
									opacity: Math.min(1, pin * 1.4) * (1 - pout),
									...w.style,
								}}
							>
								{w.text}
							</span>
						</span>
						{lineBreakAfter.includes(i) ? <br /> : ' '}
					</React.Fragment>
				);
			})}
		</div>
	);
};
