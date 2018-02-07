import throttle from 'lodash-es/throttle';
// From script tag
const { Hammer } = window;

function getPanCoordinates(e) {
  // Inspect the event object and generate normalize screen coordinates
  // (between 0 and 1) for the screen position.
  const x = e.srcEvent.clientX / window.innerWidth;
  const y = e.srcEvent.clientY / window.innerHeight;
  return { x, y };
}

// Hammer.js stuff
const myElement = document.body;
const mc = new Hammer.Manager(myElement, {
  recognizers: [
    [Hammer.Pan, { threshold: 20 }],
    [Hammer.Rotate],
  ],
});

let enable = true;
const throttleTime = 100;
let lastRotationAngle;
let rotationDiffAngle;

const handlePan = event => enable && console.log(getPanCoordinates(event));
const handleRotation = (event) => {
  if (enable) {
    rotationDiffAngle = event.rotation - lastRotationAngle;
    lastRotationAngle = event.rotation;
    console.log('rotate rotationDiffAngle', rotationDiffAngle);
    // model.rotateX(THREE.Math.degToRad(diffX));
  }
};
const handleRotationEnd = () => {
  console.log('rotateend');
  enable = false;
  setTimeout(() => {
    console.log('enabling again...');
    enable = true;
  }, throttleTime + 100);
};

mc.on('pan', throttle(handlePan, throttleTime, { leading: true, trailing: true }));
mc.on('rotatestart', (event) => {
  lastRotationAngle = event.rotation;
});
mc.on('rotate', throttle(handleRotation, throttleTime, { leading: true, trailing: true }));
mc.on('rotateend', handleRotationEnd);
