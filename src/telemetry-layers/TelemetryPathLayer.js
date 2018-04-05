import LineString from 'ol/geom/linestring';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';
import Style from 'ol/style/style';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryPathLayer extends BaseTelemetryLayer{
    init() {
        this.line = new LineString([]);
        this.layer = new VectorLayer({
            source: new Vector({
                features: [new Feature({ geometry: this.line })]
            }),
            style: this.getStyle()
        });
    }

    clear() {
        this.line.setCoordinates([]);
    }

    addMany(data) {
        var coordinates = this.line.getCoordinates();
        data.forEach((datum) => {
            coordinates.push([
            this.xFormat.parse(datum),
            this.yFormat.parse(datum)
        ])});
        this.line.setCoordinates(coordinates);
    }

    add(datum) {
        this.line.appendCoordinate([
            this.xFormat.parse(datum),
            this.yFormat.parse(datum)
        ]);
    }
    beforeDestroy() {
        this.line.setCoordinates([]);
        delete this.line;
    }
}
