import 'ol/ol.css';

export class MapView {
    constructor(domainObject) {
        
    }
    
    show(element) {
        return new Map({
            target: element,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    })
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });
    }
    
    destroy() {
        if (this.map) {

        }
    }
}