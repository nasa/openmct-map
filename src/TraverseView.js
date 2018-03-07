export default class TraverseView {
    constructor(domainObject, map, layerFactory) {
        this.domainObject = domainObject;
        this.map = map;
        this.layerFactory = layerFactory;
    }

    show(element) {
        var div = document.createElement('div');
        element.appendChild(div);
        this.map.clear();
        this.domainObject.layers
            .map(this.layerFactory.create.bind(this.layerFactory))
            .forEach(function (layer) {
                layer.show(this.map);
            }, this);
        this.map.show(div);
    }

    destroy() {
        this.map.destroy();
    }
}