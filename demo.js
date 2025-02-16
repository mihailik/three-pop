import * as THREE from 'three';
import { createScene } from 'three-pop';

const { scene, container } = createScene({
  renderer: { antialias: true },
  camera: { fov: 50 }
});

scene.add(new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
));

document.body.appendChild(container);
