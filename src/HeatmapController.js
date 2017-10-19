define([], function () {
    function HeatmapController(heatmapModel, heatmapRenderer, openmct) {
        this.heatmapModel = heatmapModel;
        this.heatmapRenderer = heatmapRenderer;
        this.openmct = openmct;
        this.latest = { x: 0, y: 0, counts: 0 };
    }

    HeatmapController.prototype.observe = function (domainObject) {
        var unsubscribes = [];

        ['x', 'y', 'counts'].forEach(function (property) {
            this.openmct.objects.get(domainObject[property]).then(function (obj) {
                obj = Object.create(obj);
                obj.domains = obj.ranges = [];
                var metadata = this.openmct.telemetry.getMetadata(obj);
                unsubscribes.push(this.openmct.telemetry.subscribe(
                    obj,
                    this.datum.bind(this, property, metadata)
                ));
            }.bind(this));
        }.bind(this));

        return function () {
            unsubscribes.forEach(function (unsubscribe) {
                unsubscribe();
            });
        };
    };

    HeatmapController.prototype.datum = function (property, metadata, datum) {
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
