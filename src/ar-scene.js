/* eslint-disable no-param-reassign, no-console */
// three.js
import {
  Scene,
  WebGLRenderer,
  Matrix4,
  Vector3,
  VRControls,
  PCFSoftShadowMap,
  DirectionalLight,
  AmbientLight,
  PlaneGeometry,
  Mesh,
  ShadowMaterial,
} from 'three';

// three.ar.js
import {
  ARDebug,
  ARUtils,
  ARPerspectiveCamera,
  ARView,
} from 'three.ar.js';

/**
 * The render loop, called once per frame. Handles updating
 * our scene and rendering.
 */
export function update(renderer, arView, camera, vrControls, scene, vrDisplay) {
  // Clears color from the frame before rendering the camera (arView) or scene.
  renderer.clearColor();

  // Render the device's camera stream on screen first of all.
  // It allows to get the right pose synchronized with the right frame.
  arView.render();

  // Update our camera projection matrix in the event that
  // the near or far planes have updated
  camera.updateProjectionMatrix();

  // Update our perspective camera's positioning
  vrControls.update();

  // Render our three.js virtual scene
  renderer.clearDepth();
  renderer.render(scene, camera);

  // Kick off the requestAnimationFrame to call this function
  // when a new VRDisplay frame is rendered
  vrDisplay.requestAnimationFrame(update.bind(
    null,
    renderer,
    arView,
    camera,
    vrControls,
    scene,
    vrDisplay,
  ));
}

/**
 * On window resize, update the perspective camera's aspect ratio,
 * and call `updateProjectionMatrix` so that we can get the latest
 * projection matrix provided from the device
 */
function addOnResizeHandler(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);
}

/**
 * When clicking on the screen, fire a ray from where the user clicked
 * on the screen and if a hit is found, place a cube there.
 */
export function getClickCoordinates(e) {
  // Inspect the event object and generate normalize screen coordinates
  // (between 0 and 1) for the screen position.
  const x = e.touches[0].pageX / window.innerWidth;
  const y = e.touches[0].pageY / window.innerHeight;
  return { x, y };
}

export function moveModelAndShadowTo(model, shadowMesh, x, y, vrDisplay) {
  // Send a ray from the point of click to the real world surface
  // and attempt to find a hit. `hitTest` returns an array of potential
  // hits.
  const hits = vrDisplay.hitTest(x, y);

  if (!model) {
    console.warn('Model not yet loaded');
    return false;
  }

  // If a hit is found, just use the first one
  if (hits && hits.length) {
    const hit = hits[0];

    // Turn the model matrix from the VRHit into a
    // THREE.Matrix4 so we can extract the position
    // elements out so we can position the shadow mesh
    // to be directly under our model. This is a complicated
    // way to go about it to illustrate the process, and could
    // be done by manually extracting the "Y" value from the
    // hit matrix via `hit.modelMatrix[13]`
    const matrix = new Matrix4();
    const position = new Vector3();
    matrix.fromArray(hit.modelMatrix);
    position.setFromMatrixPosition(matrix);

    // Set our shadow mesh to be at the same Y value
    // as our hit where we're placing our model
    // @TODO use the rotation from hit.modelMatrix
    shadowMesh.position.y = position.y;

    // Use the `placeObjectAtHit` utility to position
    // the cube where the hit occurred
    ARUtils.placeObjectAtHit(
      model, // The object to place
      hit, // The VRHit object to move the cube to
      1, // Easing value from 0 to 1; we want to move the cube directly to the hit position
      true, // Whether or not we also apply orientation
    );
    return true;
  }
  return false;
}

export function init(vrDisplay) {
  // Turn on the debugging panel
  const arDebug = new ARDebug(vrDisplay);
  document.body.appendChild(arDebug.getElement());

  // Setup the three.js rendering environment
  const renderer = new WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  document.body.appendChild(canvas);
  const scene = new Scene();

  // Creating the ARView, which is the object that handles
  // the rendering of the camera stream behind the three.js
  // scene
  const arView = new ARView(vrDisplay, renderer);

  // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
  // except when using an AR-capable browser, the camera uses
  // the projection matrix provided from the device, so that the
  // perspective camera's depth planes and field of view matches
  // the physical camera on the device.
  const camera = new ARPerspectiveCamera(
    vrDisplay,
    60,
    window.innerWidth / window.innerHeight,
    vrDisplay.depthNear,
    vrDisplay.depthFar,
  );

  // VRControls is a utility from three.js that applies the device's
  // orientation/position to the perspective camera, keeping our
  // real world and virtual world in sync.
  const vrControls = new VRControls(camera);

  // For shadows to work
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  // The materials in Poly models will render as a black mesh
  // without lights in our scenes. Let's add an ambient light
  // so our model can be scene, as well as a directional light
  // for the shadow
  const directionalLight = new DirectionalLight();
  // @TODO in the future, use AR light estimation
  directionalLight.intensity = 0.3;
  directionalLight.position.set(10, 15, 10);
  // We want this light to cast shadow
  directionalLight.castShadow = true;
  const light = new AmbientLight();
  scene.add(light);
  scene.add(directionalLight);

  // Make a large plane to receive our shadows
  const planeGeometry = new PlaneGeometry(2000, 2000);
  // Rotate our plane to be parallel to the floor
  planeGeometry.rotateX(-Math.PI / 2);

  // Create a mesh with a shadow material, resulting in a mesh
  // that only renders shadows once we flip the `receiveShadow` property
  const shadowMesh = new Mesh(
    planeGeometry,
    new ShadowMaterial({
      color: 0x111111,
      opacity: 0.15,
    }),
  );
  shadowMesh.receiveShadow = true;
  scene.add(shadowMesh);

  // Updates perspective camera's aspect ratio on window resize
  addOnResizeHandler(camera, renderer);

  return {
    canvas,
    renderer,
    arView,
    camera,
    vrControls,
    scene,
    shadowMesh,
  };
}

export function getModelFromObjFile(objPath, mtlPath, scale) {
  return ARUtils.loadModel({
    objPath,
    mtlPath,
    OBJLoader: undefined, // uses THREE.OBJLoader by default
    MTLLoader: undefined, // uses THREE.MTLLoader by default
  }).then((group) => {
    const model = group;
    // As OBJ models may contain a group with several meshes,
    // we want all of them to cast shadow
    model.children.forEach((mesh) => {
      mesh.castShadow = true;
    });
    model.scale.set(scale, scale, scale);
    return model;
  });
}

/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */
export async function getDisplay() {
  const display = await ARUtils.getARDisplay();
  if (display) {
    return display;
  }
  ARUtils.displayUnsupportedMessage();
  return Promise.reject(new Error('Could not find AR display'));
}
