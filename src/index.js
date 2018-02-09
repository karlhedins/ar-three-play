import { Math as threeMath } from 'three';
import { getDisplay, init, getModelFromObjFile, moveModelAndShadowTo, update } from './ar-scene';
import HammerHelper from './hammer-helper';

const initMoveObject = (canvas, model, shadowMesh, vrDisplay) => {
  console.log('initMoveObject()');

  const throttleTime = 30;
  const ham = new HammerHelper(canvas, throttleTime);

  const panCallback = (x, y) =>
    moveModelAndShadowTo(model, shadowMesh, x, y, vrDisplay);
  ham.registerPanCallback(panCallback);

  const rotateCallback = rotationDiffAngle =>
    model.rotateY(threeMath.degToRad(rotationDiffAngle));
  ham.registerRotateCallback(rotateCallback);
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
      reticle,
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

    initMoveObject(canvas, model, shadowMesh, vrDisplay);

    // Kick off the render loop!
    update(
      renderer,
      arView,
      camera,
      vrControls,
      scene,
      vrDisplay,
      reticle,
    );
  } catch (error) {
    console.log(error);
    if (error.message === 'Error creating WebGL context.') {
      main();
    }
  }
}
main();
