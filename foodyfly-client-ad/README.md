# FoodyFly — publicité app client (4K)

Film de 52 s, 3840×2160, 30 i/s. Assemblé dans Remotion, avec deux séquences lifestyle faites dans HyperFrames.

## Structure

| Partie | Outil | Fichiers |
|---|---|---|
| Ouverture velours, « Une envie particulière ? » | Remotion + Three.js | `src/scenes/Opener.tsx`, `src/scenes/Velvet.tsx` |
| Marché, « Et si tout devenait plus simple ? » / « Un clic. Mille envies. » | HyperFrames (GSAP) | `hyperframes-lifestyle/` → `public/clips/lifestyle.mp4` |
| Téléphone 3D, parcours de commande, carte de Moroni | Remotion + Three.js | `src/scenes/PhoneFilm.tsx`, `src/phone/*` |
| Signature, logo animé | Remotion | `src/scenes/EndCard.tsx` |

Les écrans du téléphone sont de vraies captures de l'app (`public/screens/`, 1170×2532). Les transitions à l'écran (glisser, défiler, feuille, tap) sont faites par un shader dans `src/phone/screenMaterial.ts`.

## Audio

- Voix off : Kokoro (voix française `ff_siwis`), une phrase par fichier dans `public/audio/vo/`.
- Musique et bruitages : générés en code, `audio/score.html` → `node audio/render-score.cjs`.
- Mixage (voix placée, musique baissée sous la voix, bruitages) : `audio/mix.sh` → `public/audio/mix.wav`.

## Commandes

```bash
npm i
npx remotion studio
```

```bash
cd hyperframes-lifestyle && npx --yes hyperframes@0.8.217 render -f 30 -q delivery -o ../public/clips/lifestyle.mp4
```

```bash
npx remotion render FoodyFlyAd out/FoodyFly_Client_4K.mp4 --scale=2 --concurrency=4 --crf=16 --jpeg-quality=95
```

`remotion.config.ts` pointe vers le Chrome headless local et le rendu WebGL `swangle` ; adaptez le chemin sur une autre machine.
