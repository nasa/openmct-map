export default class TraverseView {
    constructor(domainObject, map, layerFactory) {
        this.domainObject = domainObject;
        this.map = map;
        this.layerFactory = layerFactory;
        this.layers = [];
    }

    show(element) {
        this.layers = this.domainObject.layers
            .map(options => this.layerFactory.create(options));
        this.layers.forEach(layer => layer.show(this.map));

        let div = document.createElement('div');
        element.appendChild(div);
        this.map.show(div);
    }

    destroy() {
        this.map.destroy();
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];
    }
}