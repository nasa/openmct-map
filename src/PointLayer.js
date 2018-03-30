import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';
import Style from 'ol/style/style';

export default class PointLayer {
    constructor(map) {
        this.map = map;
        this.point = new Point([])
        this.layer = new VectorLayer({
            source: new Vector({
                features: [new Feature({ geometry: this.point })]
            })
        });
        map.addLayer(this.layer);
    }
    hide() {
        this.point.setCoordinates([]);
    }
    move(x, y) {
        this.point.setCoordinates([x, y])
    }
    destroy() {
        this.point.setCoordinates([]);
        this.map.removeLayer(this.layer);
        delete this.map;
        delete this.layer;
    }
}
