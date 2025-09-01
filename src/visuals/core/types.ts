// Visual core shared types
import * as THREE from 'three';

export type UniformSpec =
  | { name: string; type: 'float'; min: number; max: number; step?: number; default: number }
  | { name: string; type: 'int'; min: number; max: number; step?: number; default: number }
  | { name: string; type: 'bool'; default: boolean }
  | { name: string; type: 'color'; default: string };

export type FeatureVector = {
  level: number;
  peak: number;
  bpm?: number;
  beatPhase?: number;
  centroid?: number;
  bands?: { low: number; mid: number; high: number };
  mfcc?: number[];
};

export type VisualPack = {
  id: string;
  name: string;
  version: string;
  uniforms: UniformSpec[];
  init: (ctx: {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    size: { w: number; h: number };
  }) => void | Promise<void>;
  update: (dt: number, t: number, audio: FeatureVector, params: Record<string, unknown>) => void;
  dispose?: () => void;
};


