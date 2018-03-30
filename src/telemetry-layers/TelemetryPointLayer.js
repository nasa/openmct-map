import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryPointLayer extends BaseTelemetryLayer {
    init() {
        this.useHistorical = false;
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
    readMetadata() {
        let metadata = this.openmct.telemetry.getMetadata(this.telemetryObject);
        let xMeta = metadata.valuesForHints(['xCoordinate'])[0];
        let yMeta = metadata.valuesForHints(['yCoordinate'])[0];
        this.xFormat = this.openmct.telemetry.getValueFormatter(xMeta);
        this.yFormat = this.openmct.telemetry.getValueFormatter(yMeta);
    }
    clear() {
        this.point.setCoordinates([]);
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

