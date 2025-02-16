import * as THREE from 'three';
import { createScene } from 'three-pop';

const sc = createScene({
  animate: () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
});
const scene = sc.scene;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

document.body.appendChild(sc.container);
