# Open MCT Map

A plugin for [Open MCT](https://nasa.github.io/openmct)
adding map style visualizations.

## Build

```bash
$ npm install
```

A UMD module with associated source maps will be written to the
`dist` folder. When installed as a global, the plugin will be
available as `MapPlugin`.

## Usage

See [`index.html`](index.html) for an example of use.

## Developer Environment

To serve the application, use `webpack-dev-server`:

```bash
npm install -g webpack webpack-dev-server
webpack-dev-server
```

There is an example `index.html` included which provides
a basic instance of Open MCT with this plugin installed for development
purposes.
