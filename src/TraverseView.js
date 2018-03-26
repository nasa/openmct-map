export default class TraverseView {
    constructor(domainObject, MapView, layerFactory, selection) {
        this.domainObject = domainObject;
        this.map = new MapView();
        this.layerFactory = layerFactory;
        this.layers = [];
        this.selection = selection;
    }

    show(element) {
        this.layers = this.domainObject.layers
            .map(options => this.layerFactory.create(options));
        this.layers.forEach(layer => layer.show(this.map));

        let div = document.createElement('div');
        div.className = "abs";
        element.appendChild(div);
        this.map.show(div);
        this.map.on('select', (selected) => this.selection.select(
            selected.map((datum) => ({ context: { item: { type: 'datum', datum } } }))
        ));
    }

    destroy() {
        this.map.destroy();
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];
    }
}