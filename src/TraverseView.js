export default class TraverseView {
    constructor(domainObject, map, layerFactory) {
        this.domainObject = domainObject;
        this.map = map;
        this.layerFactory = layerFactory;
        this.layers = [];
    }

    show(element) {
        let div = document.createElement('div');
        element.appendChild(div);
        this.layers = this.domainObject.layers
            .map(this.layerFactory.create.bind(this.layerFactory));
        this.layers.forEach(function (layer) {
            layer.show(this.map);
        }, this);
        this.map.show(div);
    }

    destroy() {
        this.map.destroy();
        this.layers.forEach(function (layer) {
            layer.destroy();
        });
    }
}