class Layer {
    constructor(options) {
        this.options = options;
    }

    destroy() {
    }
}

class ImageLayer extends Layer {
    show(map) {
        map.image(
            this.options.url,
            this.options.left,
            this.options.bottom,
            this.options.right,
            this.options.top
        );
    }
}

class TelemetryLayer extends Layer {
    constructor(openmct, ids) {
        super({});
        this.telemetry = new Telemetry(openmct, ids);
    }

    show(map) {
        let layer = this.layer(map);
        this.telemetry.on('reset', layer.reset.bind(layer));
        this.telemetry.on('add', layer.add.bind(layer));
        this.telemetry.activate();
    }

    layer(map) {
        throw new Error("Unimplemented.");
    }

    destroy() {
        this.telemetry.deactivate();
    }
}

class PathLayer extends TelemetryLayer {
    layer(map) {
        return map.line();
    }
}

const CONSTRUCTORS = {
    image: ImageLayer,
    path: PathLayer
};

export default class LayerFactory {
    create(options) {
        let Constructor = CONSTRUCTORS[options.type];
        return new Constructor(options);
    }
}