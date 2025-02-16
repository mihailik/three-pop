// @ts-check

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

export const version = '1.0.3';
createScene.version = version;

export default createScene;

/**
 * @param {Partial<{
 *  renderer: ConstructorParameters<typeof THREE.WebGLRenderer>[0] & Partial<THREE.WebGLRenderer>,
 *  scene: Partial<THREE.Scene>,
 *  camera: Partial<THREE.PerspectiveCamera>,
 *  animate?: () => void
 * }>} [options]
 */
export function createScene(options) {
  const scene = new THREE.Scene();
  assignTo(scene, options?.scene);

  const camera = new THREE.PerspectiveCamera();
  assignTo(camera, options?.camera);
  if (typeof options?.camera?.fov !== 'number' && options?.camera?.fov !== null) camera.fov = 75;
  if (typeof options?.camera?.aspect !== 'number' && options?.camera?.aspect !== null) camera.aspect = window.innerWidth / window.innerHeight;
  if (typeof options?.camera?.near !== 'number' && options?.camera?.near !== null) camera.near = 0.1;
  if (typeof options?.camera?.far !== 'number' && options?.camera?.far !== null) camera.far = 1000;
  if (typeof options?.camera?.position !== 'object' && options?.camera?.position !== null) camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer(options?.renderer);
  if (options?.renderer) {
    for (const key in options?.renderer) {
      renderer[key] = options.renderer[key];
    }
  }

  /** @type {ReturnType<typeof Stats>} */
  const stats =
    // @ts-ignore
    new Stats();

  const container = document.createElement('div');
  container.style.cssText = 'min-width: 300px; min-height: 300px;';
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
    animate: options?.animate
  }

  var debounceIntersect;
  let loopEverStarted = false;
  const inter = new IntersectionObserver(arr => {
    clearTimeout(debounceIntersect);
    debounceIntersect = setTimeout(() => {
      const entry = arr[arr.length - 1];
      const needActive = entry.isIntersecting;
      const activeChanged = needActive !== active;
      result.active = active = needActive;

      let updatingLoopArgs;
      if (active) {
        const sz = container.getBoundingClientRect();
        const newAspect = sz.width / sz.height;
        camera.aspect = newAspect;
        const szVec = new THREE.Vector2();
        renderer.getSize(szVec);
        updatingLoopArgs = {
          aspect: { from: camera.aspect, to: newAspect },
          size: { from: { width: szVec.width, height: szVec.height }, to: { width: sz.width, height: sz.height } }
        };
        camera.updateProjectionMatrix();
        renderer.setSize(sz.width, sz.height);

        if (!activeChanged)
          console.log('Updating render size/aspect: ', updatingLoopArgs);
      }

      if (!activeChanged) return;

      if (active) {
        lastTick = performance.now();
        const logMsg = loopEverStarted ? 'Resuming loop' : 'Starting loop';
        if (updatingLoopArgs) console.log(logMsg, updatingLoopArgs);
        else console.log(logMsg);

        loopEverStarted = true;
        renderer.setAnimationLoop(animate);
      } else {
        console.log('Stopping loop');
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

    renderer.render(scene, camera);
  }
}

function assignTo(obj, props) {
  if (!obj || !props) return;

  for (const key in props) {
    if (props[key] && obj[key] && typeof props[key] === 'object' && typeof obj[key] === 'object') {
      assignTo(obj[key], props[key]);
    } else {
      obj[key] = props[key];
    }
  }
}