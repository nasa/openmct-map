# Open MCT Map

## v2 TODO:
1. finish locationCombiner.subscribe
2. implement measurementCombiner
    * new type
    * takes measurement channel, location channel
    * yields coordinate + range value.
3. Translate layer types:
    * [X] path layer
    * [x]point layer
    * [x]heatmap layer
    * fix "click on point" behavior.
    * [x] add button for center rover.
    * [x] add toggle button for rover following.
    * [x] toggle active baselayer
    * [x] toggle active heatmap 
4. Read path types from rover.
    
3. translate map 
4.


A plugin for [Open MCT](https://nasa.github.io/openmct)
adding map style visualizations.

## Build

```bash
$ npm install
```

A UMD module with associated source maps will be written to the
`dist` folder. When installed as a global, the plugin will be
available as `MapPlugin`.

## Configuration

The Map Plugin exposes three new types for OpenMCT:
* Location Combiner: Takes two telemetry points (one for x, one for y) and returns a location telemetry object.
* Measurement Location Synthesizer: Takes two telemetry points (one for location, one for measurement), and returns a location measurement telemetry object.
* Traverse Map: The actual map for users.

## Usage

See [`index.html`](index.html) for an example of use.

## Developer Environment

To serve the application, use `webpack-dev-server`:

```bash
npm install -g webpack webpack-dev-server
npm install nasa/openmct
webpack-dev-server
```

There is an example `index.html` included which provides
a basic instance of Open MCT with this plugin installed for development
purposes.
