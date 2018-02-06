import { getDisplay, init, getModelFromObjFile, moveModelAndShadowTo, getClickCoordinates, update } from './ar-scene';

const spawnObject = (canvas, model, shadowMesh, vrDisplay) => (event) => {
  const { x, y } = getClickCoordinates(event);
  const didWeHit = moveModelAndShadowTo(model, shadowMesh, x, y, vrDisplay);
  if (didWeHit) {
    canvas.removeEventListener('touchstart', spawnObject);
    canvas.addEventListener(
      'touchmove',
      spawnObject(canvas, model, shadowMesh, vrDisplay),
    );
  }
};

async function main() {
  try {
    const vrDisplay = await getDisplay();
    if (!vrDisplay) return;

    // Initalize the scene
    const {
      canvas,
      renderer,
      arView,
      camera,
      vrControls,
      scene,
      shadowMesh,
    } = init(vrDisplay);

    // Load the model: obj-file, material, scale
    const model = await getModelFromObjFile(
      './assets/ArcticFox_Posed.obj',
      './assets/ArcticFox_Posed.mtl',
      0.1,
    );
    // // Place the model very far away, ready to be 'spawned' on the first tap
    model.position.set(10000, 10000, 10000);
    // Add the model to the scene
    scene.add(model);

    canvas.addEventListener(
      'touchstart',
      spawnObject(canvas, model, shadowMesh, vrDisplay),
    );

    // Kick off the render loop!
    update(
      renderer,
      arView,
      camera,
      vrControls,
      scene,
      vrDisplay,
    );
  } catch (error) {
    alert(error);
    console.log(error);
  }
}
main();
