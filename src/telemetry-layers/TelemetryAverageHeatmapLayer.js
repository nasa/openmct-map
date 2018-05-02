import Point from 'ol/geom/point';
import VectorLayer from 'ol/layer/vector';
import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';

import BaseTelemetryLayer from './BaseTelemetryLayer';

const DEFAULT_GRADIENT = ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];

function getBucketId(x, y) {
    return [Math.round(x), Math.round(y)].join(':');
}

function getBucketPoint(x, y) {
    return new Point([Math.round(x), Math.round(y)]);
}

export default class TelemetryAverageHeatmapLayer extends BaseTelemetryLayer {
    init(map) {
        this.source = new Vector({
            features: []
        });
        this.buckets = {};
        this.low = this.definition.hasOwnProperty('low') ?
            this.definition.low :
            0;
        this.high = this.definition.hasOwnProperty('high') ?
            this.definition.high :
            100;
        var gradientDefinition = this.definition.hasOwnProperty('gradient') ?
            this.definition.gradient :
            DEFAULT_GRADIENT;

        this.createGradient(gradientDefinition);

        this.layer = new VectorLayer({
            source: this.source
        });
        this.map.getView().on('change:resolution', this.updateResolution, this);
        this.resolution = this.map.getView().getResolution();
    }

    createGradient(colors) {
        const canvas = document.createElement('CANVAS');
        const width = 1;
        const height = 256;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, width, height);
        const step = 1 / (colors.length - 1);
        for (let i = 0, ii = colors.length; i < ii; ++i) {
          gradient.addColorStop(i * step, colors[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        this.gradient = context.getImageData(0, 0, width, height).data;
        this.gradientCanvas = canvas;
    }

    addPoint(x, y, value) {
        var bucketId = getBucketId(x, y);
        var bucket = this.buckets[bucketId];
        if (!bucket) {
            this.buckets[bucketId] = bucket = {
                values: [],
                sum: 0,
                avg: 0,
                feature: new Feature({
                    geometry: getBucketPoint(x, y)
                }),
            };
            this.source.addFeature(bucket.feature);
        }
        bucket.values.push(value);
        bucket.sum += value;
        bucket.avg = bucket.sum / bucket.values.length;
        bucket.weight = (bucket.avg - this.low) / (this.high - this.low);
        bucket.gradientIndex = Math.round(bucket.weight * 255);
        if (bucket.values.length > 5) {
            bucket.size = 10
        } else {
            bucket.size = 5 + bucket.values.length;
        }
        this.setBucketStyle(bucket);
    }

    colorForIndex(index) {
        if (index < 0) {
            return [255,255,255];
        } else if (index > 255) {
            return [0, 0, 0];
        }
        return [
            this.gradient[index*4],
            this.gradient[index*4+1],
            this.gradient[index*4+2]
        ]
    }

    setBucketStyle(bucket) {
        bucket.feature.setStyle(new Style({
            image: new Circle({
                fill: new Fill({
                    color: this.colorForIndex(bucket.gradientIndex)
                }),
                radius: (bucket.size / 20) * 1/this.resolution
            })
        }));
    }

    updateResolution() {
        if (this.updateScheduled) {
            return;
        }
        this.updateScheduled = setTimeout(() => {
            delete this.updateScheduled;
            this.resolution = this.map.getView().getResolution();
            Object.values(this.buckets).forEach(this.setBucketStyle, this);
        });
    }

    readMetadata() {
        super.readMetadata();
        let valueMeta = this.metadata.valuesForHints(['range'])[0];
        this.valueFormat = this.openmct.telemetry.getValueFormatter(valueMeta);
    }

    clear() {
        this.source.clear();
        this.buckets = {};
    }
    add(datum) {
        var x = this.xFormat.parse(datum);
        var y = this.yFormat.parse(datum);
        var value = this.valueFormat.parse(datum);
        this.addPoint(x, y, value);
    }
    beforeDestroy() {
        this.map.getView().un('change:resolution', this.updateResolution, this);
        this.source.clear();
        delete this.source;
    }
}
