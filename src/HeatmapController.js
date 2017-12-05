define([], function () {
    function HeatmapController(data, heatmapModel, heatmapRenderer, domainObject, openmct) {
        this.data = data;
        this.heatmapModel = heatmapModel;
        this.heatmapRenderer = heatmapRenderer;
        this.openmct = openmct;
        this.latest = {};
        this.queue = [];
        this.metadata = {};
        this.requesting = false;
        this.domainObject = domainObject;
        this.unsubscribes = [];

        this.refresh = this.refresh.bind(this);
        this.bounds = this.bounds.bind(this);

        this.openmct.time.on('bounds', this.bounds);
        this.openmct.time.on('timeSystem', this.refresh);

        this.refresh();
    }

    HeatmapController.prototype.bounds = function (bounds, wasTick) {
        if (!wasTick) {
            this.refresh();
        }
    };

    HeatmapController.prototype.refresh = function () {
        var domainObject = this.domainObject;
        var requests = [];

        this.heatmapModel.clear();
        this.unsubscribes.forEach(function (unsubscribe) {
            unsubscribe();
        });
        this.unsubscribes = [];
        this.requesting = true;

        ['x', 'y', 'counts'].forEach(function (property) {
            var idParts = domainObject[property].split(":");
            var identifier = idParts.length > 1 ?
                { namespace: idParts[0], key: idParts[1] } : idParts[0];
            requests.push(this.openmct.objects.get(identifier).then(function (obj) {
                this.metadata[property] = this.openmct.telemetry.getMetadata(obj);
                this.unsubscribes.push(this.openmct.telemetry.subscribe(
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
    };

    HeatmapController.prototype.datum = function (property, datum) {
        if (this.requesting) {
            this.queue.push({ property: property, datum: datum });
            return;
        }

        var metadata = this.metadata[property];
        var metadataValues = metadata.valuesForHints(["range"]);
        if (metadataValues.length > 0) {
            this.latest[property] = datum[metadataValues[0].key];
            if (Object.keys(this.latest).length === 3) {
                this.heatmapModel.add(
                    this.latest.x,
                    this.latest.y,
                    this.latest.counts
                );
                this.scheduleRendering();
                this.latest = { x: this.latest.x, y: this.latest.y };
            }
        }
    };

    HeatmapController.prototype.handleResponses = function (responses) {
        responses = { x: responses[0], y: responses[1], counts: responses[2] };

        var index = { x: 0, y: 0, counts: 0 };
        var domain = this.openmct.time.timeSystem().key;
        var recordDatum = function (property) {
            this.datum(property, responses[property][index[property]]);
        }.bind(this);
        var keys = {};

        ['x', 'y', 'counts'].forEach(function (property) {
            var meta = this.metadata[property].valuesForHints(['domain']).find(function (m) {
                return m.source === domain || m.key === domain;
            });
            keys[property] = meta.source || meta.key || domain;
        }.bind(this));

        this.requesting = false;

        while (index.counts < responses.counts.length) {
            var countsDomainValue = responses.counts[index.counts][keys.counts];

            while (index.x < responses.x.length && responses.x[index.x][keys.x] < countsDomainValue) {
                index.x += 1;
            }

            while (index.y < responses.y.length && responses.y[index.y][keys.y] < countsDomainValue) {
                index.y += 1;
            }

            if (index.x < responses.x.length && index.y < responses.y.length) {
                ['x', 'y', 'counts'].forEach(recordDatum);
            }

            index.counts += 1;
        }

        this.flush();
    };

    HeatmapController.prototype.flush = function () {
        this.queue.forEach(function (item) {
            this.datum(item.property, item.datum);
        }, this);
        this.queue = [];
    };

    HeatmapController.prototype.scheduleRendering = function () {
        if (!this.renderScheduled) {
            this.renderScheduled = true;

            window.requestAnimationFrame(function () {
                this.renderScheduled = false;
                this.updateView();
                this.heatmapRenderer.render(this.heatmapModel);
            }.bind(this));
        }
    };

    HeatmapController.prototype.updateView = function () {
        var xTicks = [];
        var yTicks = [];
        var bounds = this.heatmapModel.bounds();
        var x = bounds.x - 1;
        var y = bounds.y - 1;
        var min = +this.domainObject.low;
        var max = +this.domainObject.high;
        var sz = Math.max(bounds.width, bounds.height) + 3;


        while (xTicks.length < sz) {
            xTicks.push(x * bounds.size);
            x += 1;
        }

        while (yTicks.length < sz) {
            yTicks.push(y * bounds.size);
            y += 1;
        }

        this.data.xTicks = xTicks;
        this.data.yTicks = yTicks;
        this.data.legendTicks = [max, (max + min) / 2, min];
    };

    HeatmapController.prototype.destroy = function () {
        this.openmct.time.off('bounds', this.refresh);
        this.openmct.time.off('timeSystem', this.refresh);
        this.unsubscribes.forEach(function (unsubscribe) {
            unsubscribe();
        });
        this.unsubscribes = [];
    };

    return HeatmapController;
});
