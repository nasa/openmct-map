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

class PathLayer extends Layer {
    show(map) {
        let xId = this.options.x;
        let yId = this.options.y;
    }
}

const CONSTRUCTORS = {
    image: ImageLayer
};

export default class LayerFactory {
    create(options) {
        let Constructor = CONSTRUCTORS[options.type];
        return new Constructor(options);
    }
}