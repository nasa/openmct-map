define([], function () {
    function HeatmapController(heatmapModel, heatmapRenderer, domainObject, openmct) {
        this.heatmapModel = heatmapModel;
        this.heatmapRenderer = heatmapRenderer;
        this.openmct = openmct;
        this.latest = { x: 0, y: 0, counts: 0 };
        this.queues = { x: [], y: [], counts: [] };
        this.metadata = {};
        this.requesting = false;
        this.domainObject = domainObject;

        this.refresh = this.refresh.bind(this);

        this.openmct.time.on('bounds', this.refresh);
        this.openmct.time.on('timeSystem', this.refresh);
    }

    HeatmapController.prototype.refresh = function () {
        var domainObject = this.domainObject;
        var unsubscribes = [];
        var requests = [];

        this.requesting = true;

        ['x', 'y', 'counts'].forEach(function (property) {
            requests.push(this.openmct.objects.get(domainObject[property]).then(function (obj) {
                this.metadata[property] = this.openmct.telemetry.getMetadata(obj);
                unsubscribes.push(this.openmct.telemetry.subscribe(
                    obj,
                    this.datum.bind(this, property)
                ));
                return this.openmct.telemetry.request(
                    obj,
                    this.openmct.time.bounds()
                );
            }.bind(this)));
        }.bind(this));

        Promise.all(requests).then(this.handleResponses.bind(this));

        return function () {
            unsubscribes.forEach(function (unsubscribe) {
                unsubscribe();
            });
        };
    };

    HeatmapController.prototype.datum = function (property, datum) {
        if (this.requesting) {
            this.queues[property].push(datum);
            return;
        }

        var metadata = this.metadata[property];
        var metadataValues = metadata.valuesForHints(["range"]);
        if (metadataValues.length > 0) {
            this.latest[property] = datum[metadataValues[0].key];
            if (property === 'counts') {
                this.heatmapModel.add(
                    this.latest.x,
                    this.latest.y,
                    this.latest.counts
                );
                this.scheduleRendering();
            }
        }
    };

    HeatmapController.prototype.handleResponses = function (responses) {
        responses = { x: responses[0], y: responses[1], counts: responses[2] };

        var index = { x: 0, y: 0, counts: 0 };
        var domain = this.openmct.time.timeSystem().key;

        while (index.counts < responses.counts.length) {
            var counts = responses.counts[index.counts];

            while (index.x < responses.x.length && responses.x[index.x][domain] < counts[domain]) {
                index.x += 1;
            }

            while (index.y < responses.y.length && responses.y[index.y][domain] < counts[domain]) {
                index.y += 1;
            }

            if (index.x < responses.x.length && index.y < responses.y.length) {
                ['x', 'y', 'counts'].forEach(function (property) {
                    this.datum(property, responses[property][index[property]]);
                }.bind(this));
            }

            index.counts += 1;
        }

        this.flush();
    };

    HeatmapController.prototype.flush = function () {
        Object.keys(this.queues).forEach(function (property) {
            this.queues[property].forEach(this.datum.bind(this, property));
        }.bind(this));

        this.requesting = false;
        this.queues = { x: [], y: [], counts: [] };
    };

    HeatmapController.prototype.scheduleRendering = function () {
        if (!this.renderScheduled) {
            this.renderScheduled = true;

            window.requestAnimationFrame(function () {
                this.renderScheduled = false;
                this.heatmapRenderer.render(this.heatmapModel);
            }.bind(this));
        }
    };

    return HeatmapController;
});
