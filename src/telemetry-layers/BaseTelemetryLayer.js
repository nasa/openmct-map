import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Circle from 'ol/style/circle';
import Style from 'ol/style/style';

export default class BaseTelemetryLayer {
    constructor(map, definition, openmct) {
        this.map = map;
        this.definition = definition;
        this.openmct = openmct;
        this.useHistory = true;
        this.useRealtime = true;
        this.onBoundsChange = this.onBoundsChange.bind(this);
        this.onTimeSystemChange = this.onTimeSystemChange.bind(this);
        this.init();
        this.map.addLayer(this.layer);
        if (this.definition.source) {
            this.loadTelemetryObject(this.definition.source);
        }
        this.layer.setProperties({name: definition.name});

    }

    getStyle() {
        let customStyle = (
            this.definition.strokeColor ||
            this.definition.strokeWidth ||
            this.definition.fillColor ||
            this.definition.pointRadius
        );
        if (!customStyle) {
            return;
        }

        let fill = new Fill({
            color: this.definition.fillColor || 'rgba(255,255,255,0.4)'
        });
        let stroke = new Stroke({
            color: this.definition.strokeColor || '#3399CC',
            width: this.definition.strokeWidth || 1.25
        });
        return [
            new Style({
                image: new Circle({
                    fill: fill,
                    stroke: stroke,
                    radius: this.definition.pointRadius || 5
                }),
                fill: fill,
                stroke: stroke
            })
        ];
        return styles;
    }

    init () {
        // Override to initialize.  Must create "layer" property.
    }

    readMetadata() {
        let xMeta = this.metadata.valuesForHints(['xCoordinate'])[0];
        let yMeta = this.metadata.valuesForHints(['yCoordinate'])[0];
        this.xFormat = this.openmct.telemetry.getValueFormatter(xMeta);
        this.yFormat = this.openmct.telemetry.getValueFormatter(yMeta);
    }

    onTimeSystemChange(timeSystem) {
        if (!timeSystem) {
            return;
        }
        let timestampMeta = this.metadata.value(timeSystem.key)
        this.timestampFormat = this.openmct.telemetry.getValueFormatter(timestampMeta);
    }

    onBoundsChange(bounds, isTick) {
        this.bounds = bounds;
        if (isTick) {
            return;
        }
        this.loadTelemetryData();
    }

    loadTelemetryObject(objectId) {
        this.openmct.objects.get(objectId)
            .then((telemetryObject) => {
                if (this.destroyed) {
                    return;
                }
                this.telemetryObject = telemetryObject;
                this.metadata = this.openmct.telemetry.getMetadata(this.telemetryObject);
                this.readMetadata();
                if (this.useRealtime || this.useHistory) {
                    this.isListeningToTime = true;
                    this.bounds = this.openmct.time.bounds();
                    this.onTimeSystemChange(this.openmct.time.timeSystem());
                    this.openmct.time.on('bounds', this.onBoundsChange);
                    this.openmct.time.on('timeSystem', this.onTimeSystemChange);
                }
                if (this.useRealtime) {
                    this.establishRealtime();
                }
                if (this.useHistory) {
                    this.loadTelemetryData();
                }
            });
    }

    handleRealtimeDatum(datum) {
        if (this.loading) {
            this.queue.push(datum);
        } else {
            this.addRealtimeDatum(datum)
        }
    }

    addRealtimeDatum(datum) {
        let timestamp = this.timestampFormat.parse(datum);
        // don't add datums outside bounds.  Uses some padding in cases
        // where time conductor is slightly behind.
        if (timestamp > (this.bounds.end + 5000)) {
            return;
        }
        if (timestamp < this.bounds.start) {
            return;
        }
        this.add(datum);
    }

    establishRealtime() {
        this.unsubscribe = this
            .openmct
            .telemetry
            .subscribe(this.telemetryObject, (datum) => {
                this.handleRealtimeDatum(datum);
            });
    }

    stopLoading() {
        this.loading = false;
        this.queue.forEach((datum) => {
            this.addRealtimeDatum(datum);
        });
        this.queue = [];
    }

    loadTelemetryData() {
        if (this.destroyed) {
            return;
        }
        this.clear();
        let loadTracker = {};
        this.loadTracker = loadTracker;
        this.loading = true;
        this.queue = []; // queue realtime data to prevent having to reorder.
        this.openmct.telemetry.request(this.telemetryObject)
            .then((data) => {

                return new Promise((resolve, reject) => {
                    let work = () => {
                        if (this.loadTracker !== loadTracker) {
                            return;
                        }
                        if (this.destroyed) {
                            return;
                        }
                        this.addMany(data.splice(0, 1000));
                        if (data.length === 0) {
                            this.stopLoading();
                            resolve();
                        } else {
                            setTimeout(work, 10);
                        }
                    };
                    work();
                });
            });
    }
    // Override addMany behavior if you can do it intelligently.
    addMany(data) {
        data.forEach(this.add, this);
    }
    clear() {
        // Override to implement "clear" behavior.
    }
    add(datum) {
        // Override to implement "add" behavior.
    }
    beforeDestroy() {
        // Override to implement cleanup behavior before this is destroyed.
    }
    destroy() {
        this.beforeDestroy();
        this.destroyed = true;
        if (this.isTrackingTime) {
            this.openmct.time.off('timeSystem', this.onTimeSystemChange);
            this.openmct.time.off('bounds', this.onBoundsChange);
        }
        if (this.unsubscribe) {
            this.unsubscribe();
            delete this.unsubscribe;
        }
        this.map.removeLayer(this.layer);
        delete this.map;
        delete this.layer;
    }
}
