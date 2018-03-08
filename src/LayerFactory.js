import TelemetryGroup from './TelemetryGroup';

class Layer {
    constructor(openmct, options) {
        this.openmct = openmct;
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
    constructor(openmct, options, ids, triggers) {
        super(openmct, options);
        this.telemetry = new TelemetryGroup(openmct, ids, triggers);
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
        this.telemetry.destroy();
    }
}

class PathLayer extends TelemetryLayer {
    constructor(openmct, options) {
        super(openmct, options, { x: options.x, y: options.y }, ['x', 'y']);
    }

    layer(map) {
        return map.line();
    }
}

class HeatLayer extends TelemetryLayer {
    constructor(openmct, options) {
        super(openmct, options, { x: options.x, y: options.y, z: options.z }, ['z']);
    }

    layer(map) {
        return map.heatmap();
    }
}

class PlanLayer extends Layer {
    show(map) {
        let layer = map.line();
        this.options.coordinates.forEach(layer.add.bind(layer));
    }
}

const CONSTRUCTORS = {
    image: ImageLayer,
    path: PathLayer,
    plan: PlanLayer,
    heat: HeatLayer
};

export default class LayerFactory {
    constructor(openmct) {
        this.openmct = openmct;
    }

    create(options) {
        let Constructor = CONSTRUCTORS[options.type];
        return new Constructor(this.openmct, options);
    }
}
