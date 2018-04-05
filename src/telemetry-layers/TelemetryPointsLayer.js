import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryPointsLayer extends BaseTelemetryLayer{
    init() {
        this.source = new Vector({features: []});
        this.layer = new VectorLayer({
            source: this.source,
            style: this.getStyle()
        });
    }
    clear() {
        this.source.clear();
    }
    addMany(data) {
        this.source.addFeatures(data.map((datum) => new Feature({
            geometry: new Point([
                this.xFormat.parse(datum),
                this.yFormat.parse(datum)
            ])
        })));
    }
    add(datum) {
        this.source.addFeature(new Feature({
            geometry: new Point([
                this.xFormat.parse(datum),
                this.yFormat.parse(datum)
            ])
        }));
    }
    beforeDestroy() {
        this.source.clear()
        delete this.source;
    }
}

