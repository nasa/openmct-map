# Open MCT Heatmap

A plugin for [Open MCT](https://nasa.github.io/openmct)
adding heat map style visualizations of telemetry data.

## Build

```bash
$ git clone https://github.com/VWoeltjen/openmct-heatmap.git
$ cd openmct-heatmap
$ npm install
```

A UMD module with associated source maps will be written to the
`dist` folder. When installed as a global, the plugin will be
available as `HeatmapPlugin`.

## Usage

See [`index.html`](index.html) for an example of use.

## Developer Environment

Follow build instructions, then trigger a build of `openmct`:

```bash
cd node_modules/openmct
npm install
cd ../..
```

To serve the application, use `webpack-dev-loader`:

```bash
npm install -g webpack webpack-dev-loader
webpack-dev-loader
```

There is an example `index.html` included which provides
a basic instance of Open MCT with this plugin installed for development
purposes.
