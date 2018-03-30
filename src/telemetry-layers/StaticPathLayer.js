import LineString from 'ol/geom/linestring';
import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class StaticPathLayer extends BaseTelemetryLayer {
    init() {
        this.line = new LineString([]);
        this.source = new Vector({
            features: [new Feature({ geometry: this.line })]
        });
        this.layer = new VectorLayer({
            source: this.source,
            style: this.getStyle()
        });
        this.definition.path.forEach((coordinate) => {
            this.line.appendCoordinate([coordinate.x, coordinate.y]);
            this.source.addFeature(new Feature({
                geometry: new Point([coordinate.x, coordinate.y]),
                label: coordinate.label
            }));
        });
    }
    clear() {
        this.source.clear();
        this.line.setCoordinates([]);;
    }
    beforeDestroy() {
        this.clear();
        delete this.line;
        delete this.source;
    }
}
