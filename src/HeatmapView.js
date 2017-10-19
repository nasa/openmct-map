define([
    './HeatmapColors',
    './HeatmapController',
    './HeatmapModel',
    './HeatmapRenderer'
], function (
    HeatmapColors,
    HeatmapController,
    HeatmapModel,
    HeatmapRenderer
) {
    function HeatmapView(domainObject, openmct, document) {
        this.domainObject = domainObject;
        this.openmct = openmct;
        this.document = document;
    }

    HeatmapView.prototype.show = function (container) {
        var canvas = this.document.createElement('canvas');
        var colors = new HeatmapColors(+this.domainObject.low, +this.domainObject.high);
        var renderer = new HeatmapRenderer(canvas, colors);
        var model = new HeatmapModel(this.domainObject.gridSize);
        this.controller = new HeatmapController(model, renderer, this.domainObject, this.openmct);

        canvas.width = canvas.height = 1000;
        container.appendChild(canvas);
    };

    HeatmapView.prototype.destroy = function () {
        if (this.controller) {
            this.controller.destroy();
            delete this.controller;
        }
    };

    return HeatmapView;
});
