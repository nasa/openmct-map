class ImageLayer {
    constructor(options) {
        this.options = options;
    }

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

const CONSTRUCTORS = {
    image: ImageLayer
};

export default class LayerFactory {
    create(options) {
        let Constructor = CONSTRUCTORS[options.type];
        return new Constructor(options);
    }
}