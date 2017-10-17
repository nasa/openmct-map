define([], function () {
    function HeatmapController(heatmapRenderer, heatmapView, openmct) {
        this.heatmapRenderer = heatmapRenderer;
        this.heatmapView = heatmapView;
        this.openmct = openmct;
        this.latest = { x: 0, y: 0, counts: 0 };
    }

    HeatmapController.prototype.observe = function (domainObject) {
        var unsubscribes = [];

        ['x', 'y', 'counts'].forEach(function (property) {
            this.openmct.objects.get(domainObject[property]).then(function (obj) {
                var metadata = this.openmct.telemetry.getMetadata(obj);
                unsubscribes.push(this.openmct.telemetry.subscribe(
                    obj,
                    this.datum.bind(this, property, metadata)
                ));
            });
        });

        return function () {
            unsubscribes.forEach(function (unsubscribe) {
                unsubscribe();
            });
        };
    };

    HeatmapController.prototype.datum = function (property, metadata, datum) {
        var metadataValues = metadata.valuesForHints(["x"]);
        if (metadataValues.length > 0) {
            this.latest[property] = datum[metadataValues[0].key];
            if (property === 'counts') {
                this.heatmapModel.add(
                    this.latest.x,
                    this.latest.y,
                    this.latest.counts
                );

                this.heatmapRenderer.render(this.heatmapModel);
            }
        }
    };

    return HeatmapController;
});
