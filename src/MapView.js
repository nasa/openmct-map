import 'ol/ol.css';

import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';

export default class MapView {
    constructor(domainObject) {

    }

    show(element) {
        var div = document.createElement('div');
        element.appendChild(div);
        this.map = new Map({
            target: div,
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