// @ts-check

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

/**
 * @param {{
 * }} [options]
 */
export function createScene(options) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
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
      if (!activeChanged) return;

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