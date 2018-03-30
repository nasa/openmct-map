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
        this.line.setCoordinates([]);
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
