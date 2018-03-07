export default class TraverseView {
    constructor(domainObject, map) {
        this.domainObject = domainObject;
        this.map = map;
    }

    buildLayers() {
        this.map.clear();
        this.domainObject.layers.forEach(this.map.layer.bind(this.map));
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