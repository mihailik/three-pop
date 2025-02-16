THREE-pop &mdash; popping a quick THREE.js demo with least effort
=======================================

This will give you a quick rotating cube setup:

```JavaScript

import * as THREE from 'three';
import { createScene } from 'three-pop';

const { scene, container } = createScene();

scene.add(new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
));

document.body.appendChild(container);

```

[Live demo: **https://raw.githack.com/mihailik/three-pop/refs/heads/main/index.html**](https://raw.githack.com/mihailik/three-pop/refs/heads/main/index.html)

<a href="https://raw.githack.com/mihailik/three-pop/refs/heads/main/index.html">

<img alt="Live demo of rotating green cube" src="https://raw.githubusercontent.com/mihailik/three-pop/refs/heads/main/demo.gif">

</a>

Constructed parts of the scene
---------------------------------

When you call **createScene()** you get a scene and a bunch of other THREE objects and things. Add your 3D objects, and pop it on the page.

* **scene**: [THREE.Scene](https://threejs.org/docs/api/en/scenes/Scene)
* **camera**: [THREE.PerspectiveCamera](https://threejs.org/docs/api/en/cameras/PerspectiveCamera) defaults to { **fov**: 75, **near**: 0.1, **far**: 1000 }
* **renderer**: [THREE.WebGLRenderer](https://threejs.org/docs/api/en/renderers/WebGLRenderer)
* **stats**: [Stats FPS widget](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/libs/stats.module.js)
* **controls**: [OrbitControls](https://threejs.org/docs/examples/en/controls/OrbitControls) rotating, zooming the scene with mouse/touch

<br>

You can pass parameters into **createScene({ ... })**:

```JavaScript
const { scene, container } = createScene({
  renderer: { antialias: true },
  camera: { fov: 50 }
});
```

License
-------
MIT &nbsp; [ <img alt="Oleg Mihailik's face" src="https://avatars.githubusercontent.com/u/4041967" width="20" style="border-radius: 1em; margin-bottom: -0.3em"> Oleg Mihailik](https://github.com/mihailik)