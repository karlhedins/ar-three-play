# ar-three-play

A starter project for developing an AR scene built with [three.ar.js](https://github.com/google-ar/three.ar.js). It's set up to spawn a 3D model by the tap of your finger that you can move and rotate along the detected surface. The model is imported from a .obj file, but other 3D file formats supported by the three.js loaders should work too.

<img alt="ar-three-play image" src="gif/demo.gif">

## Getting Started

This section will get you up and running developing your own AR scene.


### Prerequisites

Note that currently this only works on a limited set of devices on the experimental browsers [WebARonARCore](https://github.com/google-ar/WebARonARCore) and [WebARonARKit](https://github.com/google-ar/WebARonARKit). Check that your device is supported before proceeding.

### Installing

```bash
yarn
# or 
npm install
```

### Build
To transpile and bundle run the following:

```bash
yarn build
# or 
npm run build
```
The file created in the build, main.min.js, is placed in the **dist** folder. Other files not touched by the bundling are just placed there for simplicity.

### Run / Development
When building, the project also starts a local dev server on http://localhost:3000 with live reload.
To easily get your local IP run the command (en0 for your network might be on a different ID on your machine, en1, en2 etc):

```bash
ipconfig getifaddr en0
```

Also, to watch for file changes and trigger a new build and live reload run:

```bash
yarn watch
# or 
npm run watch
```

## Built With

* [three.ar.js](https://github.com/google-ar/three.ar.js) - A helper three.js library for building AR web experiences that run in WebARonARKit and WebARonARCore
* [three.js](https://github.com/mrdoob/three.js/) - JavaScript 3D library
* [hammer.js](https://github.com/hammerjs/hammer.js/) - a javascript library for multi-touch gestures
* [lodash.js](https://github.com/lodash/lodash/) - a modern JavaScript utility library delivering modularity, performance, & extras
* [rollup.js](https://github.com/rollup/rollup) - ES6 module bundler
* [babel.js](https://github.com/babel/babel) - a compiler for writing next generation JavaScript
* [eslint.js](https://github.com/eslint/eslint) - a pluggable tool for identifying and reporting on patterns in JavaScript

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Martin Splitt [AVGP](https://github.com/AVGP) for inspiring me to try AR/VR on the web
