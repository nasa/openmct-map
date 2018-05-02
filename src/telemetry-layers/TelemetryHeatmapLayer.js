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
        super.readMetadata();
        let valueMeta = this.metadata.valuesForHints(['range'])[0];
        this.valueFormat = this.openmct.telemetry.getValueFormatter(valueMeta);
    }

    clear() {
        this.source.clear();
    }
    add(datum) {
        var value = this.valueFormat.parse(datum);
        this.source.addFeature(new Feature({
            geometry: new Point([
                this.xFormat.parse(datum),
                this.yFormat.parse(datum)
            ]),
            weight: (value - this.low) / (this.high - this.low)
        }));
    }
    beforeDestroy() {
        this.source.clear();
        delete this.source;
    }
}
