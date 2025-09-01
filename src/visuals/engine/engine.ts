import * as THREE from 'three';
import { VisualPack, FeatureVector } from '@/visuals/core/types';

export type EngineOptions = {
  container: HTMLDivElement;
  pack: VisualPack;
};

export class VisualEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private clock: THREE.Clock;
  private running = false;
  private pack: VisualPack;
  private params: Record<string, any> = {};
  private audio: FeatureVector = { level: 0, peak: 0 };

  constructor(private opts: EngineOptions) {
    const { container } = opts;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // expose for packs that rely on scene lookup (MVP)
    (globalThis as any).__ej_scene = this.scene;

    this.clock = new THREE.Clock();
    this.pack = opts.pack;

    this.pack.init({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      size: { w: container.clientWidth, h: container.clientHeight },
    });

    window.addEventListener('resize', this.handleResize);
  }

  setParams(params: Record<string, any>) {
    this.params = params;
  }

  setAudio(features: FeatureVector) {
    this.audio = features;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      const dt = this.clock.getDelta();
      const t = this.clock.elapsedTime;
      this.pack.update(dt, t, this.audio, this.params);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.pack.dispose?.();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  private handleResize = () => {
    const el = this.renderer.domElement.parentElement as HTMLDivElement | null;
    if (!el) return;
    this.renderer.setSize(el.clientWidth, el.clientHeight, false);
  };
}


