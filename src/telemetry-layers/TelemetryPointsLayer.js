import Point from 'ol/geom/point';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryPointsLayer extends BaseTelemetryLayer{
    init() {
        this.source = new Vector({features: []});
        // this.points = new MultiPoint([])
        this.layer = new VectorLayer({
            source: this.source,
            style: this.getStyle()
        });
    }

    readMetadata() {
        let metadata = this.openmct.telemetry.getMetadata(this.telemetryObject);
        let xMeta = metadata.valuesForHints(['xCoordinate'])[0];
        let yMeta = metadata.valuesForHints(['yCoordinate'])[0];
        // let valueMeta = metadata.valuesForHints(['range'])[0];
        this.xFormat = this.openmct.telemetry.getValueFormatter(xMeta);
        this.yFormat = this.openmct.telemetry.getValueFormatter(yMeta);
        // this.valueFormat = this.openmct.telemetry.getValueFormatter(valueMeta);
    }

    clear() {
        this.source.clear();
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

