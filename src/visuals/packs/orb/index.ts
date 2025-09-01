import * as THREE from 'three';
import { VisualPack, FeatureVector } from '@/visuals/core/types';

// Keep state in-module for the single active instance
let shaderMaterial: THREE.ShaderMaterial | null = null;

const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// Raymarching orb with smooth palette and gentle flow. Audio modulates radius and pulse.
const fragmentShader = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uAudio;        // 0..1 smoothed audio level
uniform float uAudioGain;    // user gain scalar
uniform float uBpm;          // beats per minute
uniform float uColorShift;   // 0..1 hue shift

// Utility palette (IQ)
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d){
  return a + b*cos(6.28318*(c*t+d));
}

// Rotation around Y
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

// Signed distance to sphere with subtle ripples
float sdSphere(vec3 p, float r){ return length(p)-r; }

// Soft minimum
float smin(float a, float b, float k){ float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0); return mix(b, a, h)-k*h*(1.0-h); }

// Simple domain warp for liquid feel
vec3 warp(vec3 p, float t){
  p.xz *= rot(0.2*sin(t*0.25));
  p.xy *= rot(0.15*cos(t*0.2));
  p *= 1.0 + 0.05*sin(0.7*p.y + t*0.6);
  return p;
}

// Raymarch scene: central orb
float map(vec3 p, float t, float r){
  vec3 q = warp(p, t);
  float d = sdSphere(q, r);
  // gentle undulation on surface
  d += 0.02*sin(8.0*q.x + 6.0*q.y + 4.0*q.z + t*0.8);
  return d;
}

vec3 calcNormal(vec3 p, float t, float r){
  float e = 0.0015;
  vec2 h = vec2(1.0,-1.0)*e;
  return normalize(
    h.xyy*map(p+h.xyy,t,r) +
    h.yyx*map(p+h.yyx,t,r) +
    h.yxy*map(p+h.yxy,t,r) +
    h.xxx*map(p+h.xxx,t,r)
  );
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;

  // Camera setup
  vec3 ro = vec3(0.0, 0.0, 2.4);
  vec3 rd = normalize(vec3(uv, -1.6));

  // Beat/tempo based rotation speed
  float tempo = max(0.0, uBpm) / 60.0; // Hz
  float tempoSpeed = 0.6 + tempo * 0.8; // slow baseline + tempo influence
  float t = uTime * tempoSpeed;

  // Audio pulse shaping
  float a = clamp(uAudio * uAudioGain, 0.0, 1.5);
  float pulse = 0.85 + 0.35 * smoothstep(0.0, 1.0, a);
  float radius = 0.55 * pulse; // orb grows with volume

  // Keep camera steady; rotate the model instead (applied per-step below)

  // Raymarch
  float d = 0.0;
  float tacc = 0.0;
  vec3 p;
  bool hit = false;
  for(int i=0;i<96;i++){
    p = ro + rd * tacc;
    // rotate scene around origin so orb spins but stays centered
    vec3 pm = p;
    pm.xz = rot(0.3*t) * pm.xz;
    pm.xy = rot(0.15*t) * pm.xy;
    d = map(pm, t, radius);
    if (d < 0.001){ hit = true; break; }
    tacc += d * 0.8; // relaxed step for smoothness
    if (tacc>6.0) break;
  }

  vec3 col = vec3(0.02, 0.03, 0.06); // deep background
  if (hit){
    vec3 n = calcNormal(p, t, radius);
    vec3 l = normalize(vec3(0.6, 0.7, 0.4));
    float diff = clamp(dot(n,l), 0.0, 1.0);
    float rim = pow(1.0 - max(0.0, dot(n, -rd)), 2.0);

    // Tie-dye palette over angle and height
    float band = 0.5 + 0.5*sin(6.283*(0.15*p.y + 0.12*t) + uColorShift*6.283);
    vec3 base = palette(band,
      vec3(0.45, 0.52, 0.75),
      vec3(0.35, 0.32, 0.28),
      vec3(0.65, 0.75, 0.80),
      vec3(uColorShift, 0.25, 0.85)
    );

    col = base * (0.25 + 0.75*diff) + rim * vec3(0.7, 0.85, 1.0);
    // subtle bloom-like boost on pulse
    col += 0.15 * smoothstep(0.7, 1.2, pulse) * vec3(0.2, 0.35, 0.55);
  }

  // Gentle vignette
  float v = smoothstep(1.1, 0.2, length(uv));
  col *= v;

  // Filmic tonemap
  col = col / (1.0 + col);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const orbPack: VisualPack = {
  id: 'orb',
  name: 'Tempo Orb',
  version: '0.1.0',
  uniforms: [
    { name: 'speed', type: 'float', min: 0.15, max: 0.3, default: 0.15 },
    { name: 'colorShift', type: 'float', min: 0, max: 1, default: 0.5 },
    { name: 'audioGain', type: 'float', min: 0, max: 4, default: 1 },
  ],
  init: ({ scene, size }) => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(size.w, size.h) },
        uAudio: { value: 0 },
        uAudioGain: { value: 1 },
        uBpm: { value: 120 },
        uColorShift: { value: 0.5 },
      },
    });
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);
  },
  update: (dt: number, t: number, audio: FeatureVector, params: Record<string, unknown>) => {
    if (!shaderMaterial) return;
    const m = shaderMaterial;

    // Smooth audio for stability
    const level = Math.max(0, Math.min(1, audio.level || 0));
    // Keep a smoothed envelope in a hidden uniform using existing value
    // We re-use uAudio to store smoothed level each frame
    const prev = (m.uniforms.uAudio.value as number) || 0;
    const smoothing = 0.9; // higher = smoother
    const smooth = smoothing * prev + (1.0 - smoothing) * level;

    const bpm = (params as { bpm?: number }).bpm ?? audio.bpm ?? 120;
    const colorShift = (params as { colorShift?: number }).colorShift ?? 0.5;
    const audioGain = (params as { audioGain?: number }).audioGain ?? 1.0;

    m.uniforms.uTime.value = t * ((params as { speed?: number }).speed ?? 1.0);
    m.uniforms.uAudio.value = smooth;
    m.uniforms.uAudioGain.value = audioGain;
    m.uniforms.uBpm.value = bpm;
    m.uniforms.uColorShift.value = colorShift;
  },
  dispose: () => {
    if (shaderMaterial) {
      shaderMaterial.dispose();
      shaderMaterial = null;
    }
  },
};

export default orbPack;


