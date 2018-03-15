import EventEmitter from "eventemitter3";

export default class TelemetryGroup extends EventEmitter {
    constructor(openmct, ids, triggers) {
        super();
        this.openmct = openmct;
        this.ids = ids;
        this.triggers = triggers;
        this.metadata = {};
        this.keys = {};
        this.unsubscribes = {};
        this.requests = {};
        this.latest = {};
        this.seen = {};
        this.queue = [];
        this.timeSystemCallback = this.activate.bind(this);
        this.boundsCallback = (bounds, wasTick) => (!wasTick && this.activate());
    }

    activate() {
        let properties = Object.keys(this.ids);
        let bounds = this.openmct.time.bounds();
        let data = {};
        this.emit('reset');
        this.loading = true;

        this.openmct.time.on('bounds', this.boundsCallback);
        this.openmct.time.on('timeSystem', this.timeSystemCallback);

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
            let domain = this.openmct.time.timeSystem().key;

            properties.forEach(function (property) {
                let metadata = this.metadata[property];
                let domainMetadata = metadata.valuesForHints(['domain'])
                    .find((m) => m.source === domain || m.key === domain);
                this.keys[property] = {
                    domain: domainMetadata.source || domainMetadata.key || domain,
                    range: metadata.valuesForHints(["range"])[0].key
                };
            });

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
            let remaining = (property) => indexes[property] < data[property].length;
            let time = (property) => data[property][indexes[property]][this.keys[property].domain];

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
            this.latest[property] = datum[this.keys[property].range];
            this.latest['time'] = datum[this.keys[property].domain];
            this.seen[property] = true;
            if (this.triggers.every((trigger => this.seen[trigger]))) {
                this.emit('add', this.latest);
                this.seen = {};
            }
        }
    }

    destroy() {
        Object.keys(this.unsubscribes).forEach(function (property) {
            this.unsubscribes[property]();
        }, this);
        this.unsubscribes = {};
        this.openmct.time.off('bounds', this.boundsCallback);
        this.openmct.time.off('timeSystem', this.timeSystemCallback);
    }
}
