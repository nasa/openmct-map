import Point from 'ol/geom/point';
import Heatmap from 'ol/layer/heatmap';
import Vector from 'ol/source/vector';
import Feature from 'ol/feature';

import BaseTelemetryLayer from './BaseTelemetryLayer';

export default class TelemetryHeatmapLayer extends BaseTelemetryLayer {
    init(map) {
        this.source = new Vector({
            features: []
        });
        this.low = this.definition.hasOwnProperty('low') ?
            this.definition.low :
            0;
        this.high = this.definition.hasOwnProperty('high') ?
            this.definition.high :
            100;
        this.layer = new Heatmap({
            source: this.source,
            gradient: this.definition.gradient,
            blur: this.definition.blur,
            radius: this.definition.radius,
        });
    }

    readMetadata() {
        let metadata = this.openmct.telemetry.getMetadata(this.telemetryObject);
        let xMeta = metadata.valuesForHints(['xCoordinate'])[0];
        let yMeta = metadata.valuesForHints(['yCoordinate'])[0];
        let valueMeta = metadata.valuesForHints(['range'])[0];
        this.xFormat = this.openmct.telemetry.getValueFormatter(xMeta);
        this.yFormat = this.openmct.telemetry.getValueFormatter(yMeta);
        this.valueFormat = this.openmct.telemetry.getValueFormatter(valueMeta);
    }

    clear() {
        this.source.clear();
    }
    add(datum) {
        var value = this.valueFormat.parse(datum);
        (value - this.definition.low) / (this.definition.high - this.definition.low)
        this.source.addFeature(new Feature({
            geometry: new Point([
                this.xFormat.parse(datum),
                this.yFormat.parse(datum)
            ]),
            weight: (value - this.definition.low) / (this.definition.high - this.definition.low)
        }));
    }
    destroy() {
        this.source.clear();
        delete this.source;
    }
}
