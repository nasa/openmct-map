# Open MCT Map

## v0.3.0 TODO:
1. Retrieve timestamp from point.
2. Implement time based baselayers.

## Known Bugs
1. Changing time system will will probably break realtime data until view is reloaded.

A plugin for [Open MCT](https://nasa.github.io/openmct)
adding map style visualizations.  This plugin is experimental and not intended
for production usage.

## Usage


1. `npm install nasa/openmct-map`
2. include `node_modules/openmct-map/dist/openmct-map.js` and `node_modules/openmct-map/dist/openmct-map.css` in your `index.html`, or load with your favorite module loader.
    ```html
    <script src="node_modules/openmct-map/dist/openmct-map.js"></script>
    <link rel="stylesheet" href="node_modules/openmct-map/dist/openmct-map.css" type="text/css" media="screen">
    ```
3. install plugin in OpenMCT before starting:
    ```javascript
    openmct.install(new OpenMCTMapPlugin());
    ```

## Build

```bash
$ npm install
```

A UMD module with associated source maps will be written to the
`dist` folder. When installed as a global, the plugin will be
available as `MapPlugin`.

## Configuration

The Map Plugin exposes three new types for OpenMCT:
* Location Combiner: Takes two telemetry points (one for x, one for y) and returns a location telemetry object.  For testing, use one of these with two sine wave generators to get a "location".
* Measurement Location Synthesizer: Takes two telemetry points (one for location, one for measurement), and returns a location measurement telemetry object.
* Traverse Map: The actual map for users.

The traverse map has a JSON field where you can specify layers to add.


## Usage

See [`index.html`](index.html) for an example of use.

## Developer Environment

You'll need to install nasa/openmct, and then run the simple dev server.

Rollup seems to fail to detect changes in files on some systems, so you might 
spend a lot of time restarting the dev server.

```bash
npm install nasa/openmct
npm run dev
```
