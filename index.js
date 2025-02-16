// @ts-check

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import { version } from './package.json';

createScene.version = version;

/**
 * @param {ConstructorParameters<typeof THREE.WebGLRenderer>[0] & {
 *  fov?: ConstructorParameters<typeof THREE.PerspectiveCamera>[0],
 *  aspect?: ConstructorParameters<typeof THREE.PerspectiveCamera>[1],
 *  near?: ConstructorParameters<typeof THREE.PerspectiveCamera>[2],
 *  far?: ConstructorParameters<typeof THREE.PerspectiveCamera>[3],
 * }} [options]
 */
export default function createScene(options) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(options?.fov, options?.aspect, options?.near, options?.far);
  const renderer = new THREE.WebGLRenderer(options);
  /** @type {ReturnType<typeof Stats>} */
  const stats =
    // @ts-ignore
    new Stats();

  const container = document.createElement('div');
  container.appendChild(renderer.domElement);
  container.appendChild(stats.dom);

  let lastTick = performance.now();
  let active = false;

  const result = {
    scene,
    camera,
    renderer,
    stats,
    container,

    worldStartTime: lastTick,
    time: 0,
    delta: 0,
    resizeCheckEvery: 1500 + Math.random() * 100,
    active: false,

    /** @type {(() => void) | undefined} */
    animate: undefined
  }

  var debounceIntersect;
  const inter = new IntersectionObserver(arr => {
    clearTimeout(debounceIntersect);
    debounceIntersect = setTimeout(() => {
      const needActive = arr[0].isIntersecting;
      const activeChanged = needActive !== active;
      result.active = active = needActive;
      if (!activeChanged) {
        if (active) {
          const sz = container.getBoundingClientRect();
          camera.aspect = sz.width / sz.height;
          camera.updateProjectionMatrix();
          renderer.setSize(sz.width, sz.height);
        }

        return;
      }

      if (active) {
        lastTick = performance.now();
        renderer.setAnimationLoop(animate);
      } else {
        renderer.setAnimationLoop(null);
      }
    }, 100);
  });
  inter.observe(container);

  return result;

  function animate() {
    const now = performance.now();
    result.delta = now - lastTick;
    result.time = now - result.worldStartTime;

    if (typeof result.animate === 'function') {
      result.animate();
    }
  }
}