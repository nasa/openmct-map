import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryPointLayer extends BaseTelemetryLayer {
    init() {
        this.useHistory = false;
        this.point = new Point([]);
        this.layer = new VectorLayer({
            source: new Vector({features: [
                new Feature({
                    geometry: this.point
                })
            ]}),
            style: this.getStyle()
        });
    }
    clear() {
        this.point.setCoordinates([]);
    }
    addMany(data) {
        this.add(data[data.length - 1]);
    }
    add(datum) {
        this.point.setCoordinates([
            this.xFormat.parse(datum),
            this.yFormat.parse(datum)
        ]);
    }
    beforeDestroy() {
        this.clear();
        delete this.point;
    }
}

