import throttle from 'lodash-es/throttle';
// From script tag
const { Hammer } = window;

export default class HammerHelper {
  constructor(domElement, throttleTime) {
    this.domElement = domElement;
    this.throttleTime = domElement;

    this.enable = true;
    this.throttleTime = throttleTime;
    this.lastRotationAngle = 0;
    this.rotationDiffAngle = 0;

    this.mc = new Hammer.Manager(this.domElement, {
      recognizers: [[Hammer.Pan, { threshold: 20 }], [Hammer.Rotate]],
    });

    // Bind event listeners
    // this.handlePan.bind(this);
    // this.handleRotation.bind(this);
  }

  static getPanCoordinates(event) {
    // Inspect the event object and generate normalize screen coordinates
    // (between 0 and 1) for the screen position.
    const x = event.srcEvent.clientX / window.innerWidth;
    const y = event.srcEvent.clientY / window.innerHeight;
    return { x, y };
  }

  // One finger panning
  registerPanCallback(panCallback) {
    this.panCallback = panCallback;
    this.mc.on(
      'pan',
      throttle(this.handlePan.bind(this), this.throttleTime, {
        leading: true,
        trailing: true,
      }),
    );
  }

  handlePan(event) {
    if (this.enable) {
      const { x, y } = HammerHelper.getPanCoordinates(event);
      this.panCallback(x, y);
    }
  }

  // Two finger rotate
  handleRotationStart(event) {
    console.log('rotatestart');
    this.lastRotationAngle = event.rotation;
  }

  handleRotationEnd() {
    console.log('rotateend');
    this.enable = false;
    setTimeout(() => {
      console.log('enabling again...');
      this.enable = true;
    }, this.throttleTime + 100);
  }

  registerRotateCallback(rotateCallback) {
    this.rotateCallback = rotateCallback;

    // Enables and disabled event listeners for a short while
    // after the end of a rotation in order to avoid unnecessary events
    this.mc.on('rotatestart', this.handleRotationStart.bind(this));
    this.mc.on('rotateend', this.handleRotationEnd.bind(this));

    this.mc.on(
      'rotate',
      throttle(this.handleRotation.bind(this), this.throttleTime, {
        leading: true,
        trailing: true,
      }),
    );
  }

  handleRotation(event) {
    if (this.enable) {
      // Perform our rotation mutation
      this.rotationDiffAngle = this.lastRotationAngle - event.rotation;
      this.lastRotationAngle = event.rotation;
      this.rotateCallback(this.rotationDiffAngle);
    }
  }
}
