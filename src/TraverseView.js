export default class TraverseView {
    constructor(domainObject, map) {
        this.domainObject = domainObject;
        this.map = map;
    }

    show(element) {
        var div = document.createElement('div');
        element.appendChild(div);
        this.map.show(div);
    }

    destroy() {
        this.map.destroy();
    }
}