import * as THREE from 'three';

// Screen modes: how texture A hands over to texture B as `progress` goes 0 → 1.
export const MODE = {
	still: 0,
	push: 1, // B slides in from the right, A drifts left
	sheet: 2, // B's bottom sheet rises over a dimmed A
	scroll: 3, // A scrolls up into B (B is A scrolled by `scrollD`)
	reveal: 4, // B is revealed by a circle growing from `tap`
	pushBack: 5, // reverse push: B slides in from the left
} as const;

export type ScreenState = {
	a: string;
	b?: string;
	mode?: number;
	progress?: number;
	sheetTop?: number;
	scrollD?: number;
	tap?: [number, number];
	tapP?: number; // 0 → 1 ring progress, < 0 hides it
	bright?: number;
};

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = /* glsl */ `
uniform sampler2D texA;
uniform sampler2D texB;
uniform int mode;
uniform float p;
uniform float sheetTop;
uniform float scrollD;
uniform float fixTop;
uniform float fixBot;
uniform vec2 tap;
uniform float tapP;
uniform float bright;
uniform float aspect;
varying vec2 vUv;

vec3 sA(vec2 uv){ return texture2D(texA, vec2(uv.x, 1.0 - uv.y)).rgb; }
vec3 sB(vec2 uv){ return texture2D(texB, vec2(uv.x, 1.0 - uv.y)).rgb; }

void main(){
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y); // top-left origin
  vec3 c;
  if (mode == 0) {
    c = sA(uv);
  } else if (mode == 1 || mode == 5) {
    float dir = mode == 1 ? 1.0 : -1.0;
    float edge = mode == 1 ? 1.0 - p : p;
    bool inB = mode == 1 ? uv.x >= edge : uv.x <= edge;
    if (uv.y < fixTop) { c = sA(uv); }
    else if (inB) { c = sB(vec2(uv.x - dir * (1.0 - p), uv.y)); }
    else {
      c = sA(vec2(uv.x + dir * 0.3 * p, uv.y)) * (1.0 - 0.35 * p);
      float d = abs(uv.x - edge);
      c *= 1.0 - 0.25 * p * exp(-d * 40.0);
    }
  } else if (mode == 2) {
    float off = (1.0 - p) * (1.0 - sheetTop);
    float yb = uv.y - off;
    if (yb >= sheetTop) { c = sB(vec2(uv.x, yb)); }
    else { c = mix(sA(uv), sB(uv), p); }
  } else if (mode == 3) {
    float s = p * scrollD;
    if (uv.y < fixTop || uv.y > 1.0 - fixBot) { c = sA(uv); }
    else {
      float cy = uv.y + s;
      c = cy < 1.0 - fixBot ? sA(vec2(uv.x, cy)) : sB(vec2(uv.x, cy - scrollD));
    }
  } else {
    vec2 d = (uv - tap) * vec2(aspect, 1.0);
    float r = p * 1.25;
    float m = smoothstep(r, r - 0.004, length(d));
    c = mix(sA(uv), sB(uv), m);
  }
  if (tapP >= 0.0 && tapP <= 1.0) {
    vec2 d = (uv - tap) * vec2(aspect, 1.0);
    float l = length(d);
    float rr = 0.012 + 0.05 * tapP;
    float fade = 1.0 - tapP;
    float fill = smoothstep(rr, rr - 0.004, l) * 0.22 * fade;
    float ring = smoothstep(0.004, 0.0, abs(l - rr)) * 0.55 * fade;
    c = mix(c, vec3(1.0), fill + ring);
  }
  gl_FragColor = vec4(c * bright, 1.0);
  #include <colorspace_fragment>
}`;

export const makeScreenMaterial = () =>
	new THREE.ShaderMaterial({
		vertexShader: vertex,
		fragmentShader: fragment,
		toneMapped: false,
		uniforms: {
			texA: {value: null},
			texB: {value: null},
			mode: {value: 0},
			p: {value: 0},
			sheetTop: {value: 0.5},
			scrollD: {value: 0.616},
			fixTop: {value: 44 / 844},
			fixBot: {value: 160 / 844},
			tap: {value: new THREE.Vector2(0.5, 0.5)},
			tapP: {value: -1},
			bright: {value: 1},
			aspect: {value: 390 / 844},
		},
	});
