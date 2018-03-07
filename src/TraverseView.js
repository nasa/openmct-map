class LayerHandler {
    constructor(map) {
        this.map = map;
    }

    handle(layer) {
        this[layer.type](layer);
    }

    image(options) {
        this.map.image(
            options.url,
            options.left,
            options.bottom,
            options.right,
            options.top
        );
    }

    plan(options) {

    }

    path(options) {

    }

    heatmap(options) {

    }
};

export default class TraverseView {
    constructor(domainObject, map) {
        this.domainObject = domainObject;
        this.map = map;
        this.handler = new LayerHandler(map);
    }

    buildLayers() {
        this.map.clear();
        this.domainObject.layers.forEach(this.handler.handle.bind(this.handler));
    }

    show(element) {
        var div = document.createElement('div');
        element.appendChild(div);
        this.map.show(div);
        buildLayers();
    }

    destroy() {
        this.map.destroy();
    }
}