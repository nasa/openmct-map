# Open MCT Map

## v2 TODO:
1. needs to be responsive to time conductor events.
2. should filter subscribed data outside current range.
3. Need to be able to retrieve timestamp from point (e.g. feature)


## Known Bugs
1. Changing time system will break realtime data until view is reloaded.
2. Does not currently obey time conductor.
3. Can't retrieve timestamp from point.





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
