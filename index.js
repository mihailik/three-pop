// @ts-check

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export const version = '1.0.5';
createScene.version = version;

export default createScene;

const STEADY_ROTATION_SPEED = 0.2;

/**
 * @param {Partial<{
 *  renderer: ConstructorParameters<typeof THREE.WebGLRenderer>[0] & Partial<THREE.WebGLRenderer>,
 *  scene: Partial<THREE.Scene>,
 *  camera: Partial<THREE.PerspectiveCamera>,
 *  stats: Partial<ReturnType<Stats>>,
 *  controls: Partial<OrbitControls>,
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
  if (typeof options?.camera?.position !== 'object' && options?.camera?.position !== null) camera.position.set(0, 0, 2);

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
  assignTo(stats, options?.stats);

  const container = document.createElement('div');
  container.style.cssText = 'min-width: 300px; min-height: 300px;';
  container.appendChild(renderer.domElement);
  container.appendChild(stats.dom);

  const controls = new OrbitControls(camera, container);
  assignTo(controls, options?.controls);
  if (typeof options?.controls?.enableDamping !== 'boolean' && options?.controls?.enableDamping !== null) controls.enableDamping = true;
  if (typeof options?.controls?.autoRotate !== 'boolean' && options?.controls?.autoRotate !== null) controls.autoRotate = true;
  if (typeof options?.controls?.autoRotateSpeed !== 'number' && options?.controls?.autoRotateSpeed !== null) controls.autoRotateSpeed = STEADY_ROTATION_SPEED;
  if (typeof options?.controls?.maxDistance !== 'number' && options?.controls?.maxDistance !== null) controls.maxDistance = 40 * 1000;

  controls.addEventListener('start', function () {
    pauseRotation();
  });

  // restart autorotate after the last interaction & an idle time has passed
  controls.addEventListener('end', function () {
    waitAndResumeRotation();
  });

  let lastTick = performance.now();
  let active = false;

  const outcome = {
    scene,
    camera,
    renderer,
    stats,
    controls,
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
      outcome.active = active = needActive;

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

  return outcome;

  function animate() {
    const now = performance.now();
    outcome.delta = now - lastTick;
    outcome.time = now - outcome.worldStartTime;

    stats.begin();

    controls.update(Math.min(outcome.delta / 1000, 0.2));

    if (typeof outcome.animate === 'function') {
      outcome.animate();
    }

    renderer.render(scene, camera);

    stats.end();
  }

  var changingRotationInterval;
  function pauseRotation() {
    if (controls.autoRotate) controls.autoRotate = false;

    outcome.rotating = false;
    clearInterval(changingRotationInterval);
  }

  function waitAndResumeRotation(resumeAfterWait) {
    const WAIT_BEFORE_RESUMING_MSEC = 10000;
    const SPEED_UP_WITHIN_MSEC = 10000;

    if (!resumeAfterWait) resumeAfterWait = WAIT_BEFORE_RESUMING_MSEC;

    clearInterval(changingRotationInterval);
    const startResumingRotation = outcome.time;
    changingRotationInterval = setInterval(continueResumingRotation, 100);


    function continueResumingRotation() {
      const passedTime = outcome.time - startResumingRotation;
      if (passedTime < resumeAfterWait) return;
      if (passedTime > resumeAfterWait + SPEED_UP_WITHIN_MSEC) {
        controls.autoRotateSpeed = STEADY_ROTATION_SPEED;
        controls.autoRotate = true;
        outcome.rotating = true;
        clearInterval(changingRotationInterval);
        return;
      }

      const phase = (passedTime - resumeAfterWait) / SPEED_UP_WITHIN_MSEC;
      controls.autoRotate = true;
      outcome.rotating = true;
      controls.autoRotateSpeed = 0.2 * dampenPhase(phase);
    }
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

/** @param {number} phase */
function dampenPhase(phase) {
  return (1 - Math.cos(phase * Math.PI)) / 2;
}
