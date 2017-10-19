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
        var renderer = new HeatmapRenderer(canvas, new HeatmapColors(0, 10));
        var model = new HeatmapModel();
        var controller = new HeatmapController(model, renderer, this.domainObject, this.openmct);

        canvas.width = canvas.height = 1000;

        this.unobserve = controller.observe(this.domainObject);

        container.appendChild(canvas);
    };

    HeatmapView.prototype.destroy = function () {
        if (this.unobserve) {
            this.unobserve();
            delete this.unobserve;
        }
    };

    return HeatmapView;
});
