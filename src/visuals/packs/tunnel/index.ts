import * as THREE from 'three';
import { VisualPack, FeatureVector } from '@/visuals/core/types';
type TunnelParams = { speed?: number; distortion?: number; colorShift?: number; audioGain?: number };

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uSpeed;
uniform float uDistortion;
uniform float uColorShift;
uniform float uAudio;

// simple hash noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(in vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * (0.4 + uSpeed * 1.2);

  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float tunnel = 1.0 / max(0.2, r + 0.2 + 0.15 * sin(6.0 * r - t));

  float swirl = noise(uv * (3.0 + 2.0 * uDistortion) + vec2(t * 0.2, -t * 0.17));
  float pulse = 0.6 + 0.4 * sin(t * 3.14 + 6.283 * uAudio);
  vec3 base = vec3(0.5 + 0.5 * sin(t + vec3(0.0, 2.1, 4.2) + uColorShift * 6.283));
  vec3 col = base * tunnel * (0.8 + 0.6 * swirl) * (0.8 + 0.8 * pulse);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const tunnelPack: VisualPack = {
  id: 'tunnel',
  name: 'Audio Tunnel',
  version: '0.1.0',
  uniforms: [
    { name: 'speed', type: 'float', min: 0, max: 2, default: 1 },
    { name: 'distortion', type: 'float', min: 0, max: 1, default: 0.35 },
    { name: 'colorShift', type: 'float', min: 0, max: 1, default: 0.5 },
    { name: 'audioGain', type: 'float', min: 0, max: 4, default: 1 },
  ],
  init: ({ scene, size }) => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }',
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(size.w, size.h) },
        uSpeed: { value: 1 },
        uDistortion: { value: 0.35 },
        uColorShift: { value: 0.5 },
        uAudio: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'tunnelMesh';
    scene.add(mesh);
  },
  update: (dt: number, t: number, audio: FeatureVector, params: TunnelParams) => {
    // find our mesh by name within the scene reference stored at init time
    // this relies on the engine exposing the scene globally for MVP; later, packs receive refs
    const sceneRef = (globalThis as unknown as { __ej_scene?: THREE.Scene }).__ej_scene;
    if (!sceneRef) return;
    const mesh = sceneRef.getObjectByName('tunnelMesh') as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null;
    if (!mesh) return;
    const m = mesh.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value = t;
    m.uniforms.uSpeed.value = params.speed ?? 1;
    m.uniforms.uDistortion.value = params.distortion ?? 0.35;
    m.uniforms.uColorShift.value = params.colorShift ?? 0.5;
    const audioVal = (audio?.level ?? 0) * (params.audioGain ?? 1);
    m.uniforms.uAudio.value = audioVal;
  },
  dispose: () => {},
};

export default tunnelPack;


