import EventEmitter from "eventemitter3";

export default class TelemetryGroup extends EventEmitter {
    constructor(openmct, ids) {
        super();
        this.openmct = openmct;
        this.ids = ids;
        this.metadata = {};
        this.unsubscribes = {};
        this.requests = {};
        this.latest = {};
        this.queue = [];
    }

    activate() {
        let properties = Object.keys(this.ids);
        let bounds = this.openmct.time.bounds();
        let data = {};
        this.emit('reset');
        this.loading = true;
        Promise.all(properties.map(function (property) {
            let idParts = this.ids[property].split(":");
            let identifier = idParts.length > 1 ?
                { namespace: idParts[0], key: idParts[1] } : idParts[0];
            let add = this.add.bind(this, property);
            return this.openmct.objects.get(identifier).then(function (object) {
                this.metadata[property] =
                    this.openmct.telemetry.getMetadata(object);
                this.unsubscribes[property] =
                    this.openmct.telemetry.subscribe(object, add);
                this.requests[property] =
                    this.openmct.telemetry.request(object, bounds);
            }.bind(this));
        }, this)).then(function () {
            return Promise.all(properties.map(function (property) {
                return this.requests[property].then(function (series) {
                    data[property] = series;
                });
            }, this));
        }.bind(this)).then(function () {
            let indexes = properties.reduce(function (indexes, property) {
                indexes[property] = 0;
                return indexes;
            }, {});
            let domain = this.openmct.time.timeSystem().key;
            let keys = properties.reduce(function (keys, property) {
                var meta = this.metadata[property].valuesForHints(['domain']).find(function (m) {
                    return m.source === domain || m.key === domain;
                });
                keys[property] = meta.source || meta.key || domain;
                return keys;
            }.bind(this), {});
            let remaining = (property) => indexes[property] < data[property].length;
            let time = (property) => data[property][indexes[property]][keys[property]];

            this.loading = false;

            while (properties.some(remaining)) {
                let timestamp =
                    properties.filter(remaining).map(time).reduce((a, b) => a < b ? a : b);

                properties.forEach(function (property) {
                    while (remaining(property) && time(property) <= timestamp) {
                        this.add(property, data[property][indexes[property]]);
                        indexes[property] += 1;
                    }
                }, this);
            }

            this.queue.forEach(function (pending) {
                this.add(pending.property, pending.datum);
            }, this);
            this.queue = [];
        }.bind(this));
    }

    add(property, datum) {
        if (this.loading) {
            this.queue.push({ property, datum });
        } else {
            // Add datum, emit event if appropriate
            let metadata = this.metadata[property];
            let metadataValues = metadata.valuesForHints(["range"]);
            if (metadataValues.length > 0) {
                this.latest[property] = datum[metadataValues[0].key];
                if (Object.keys(this.latest).length === Object.keys(this.ids).length) {
                    this.emit('add', this.latest);
                    this.latest = {};
                }
            }
        }
    }

    destroy() {
        Object.keys(this.unsubscribes).forEach(function (property) {
            this.unsubscribes[property]();
        }, this);
        this.unsubscribes = {};
    }
}
