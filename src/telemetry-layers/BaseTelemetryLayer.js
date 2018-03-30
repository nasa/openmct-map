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
        // Default noop.
    }

    loadTelemetryObject(objectId) {
        this.openmct.objects.get(objectId)
            .then((telemetryObject) => {
                if (this.destroyed) {
                    return;
                }
                this.telemetryObject = telemetryObject;
                this.readMetadata();
                if (this.useRealtime) {
                    this.establishRealtime();
                }
                if (this.useHistory) {
                    this.loadTelemetryData();
                }
            });
    }

    establishRealtime() {
        this.unsubscribe = this
            .openmct
            .telemetry
            .subscribe(this.telemetryObject, (datum) => {
                if (this.loading) {
                    this.queue.push(datum);
                } else {
                    this.add(datum);
                }
            })
    }

    stopLoading() {
        this.loading = false;
        this.queue.forEach((datum) => {
            this.add(datum)
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
                        data.splice(0, 100).forEach((datum) => this.add(datum));
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
        if (this.unsubscribe) {
            this.unsubscribe();
            delete this.unsubscribe;
        }
        this.map.removeLayer(this.layer);
        delete this.map;
        delete this.layer;
    }
}
