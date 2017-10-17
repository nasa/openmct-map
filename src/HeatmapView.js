define([
    './HeatmapColors',
    './HeatmapController',
    './HeatmapModel',
    './HeatmapRenderer',
    'zepto'
], function (
    HeatmapColors,
    HeatmapController,
    HeatmapModel,
    HeatmapRenderer,
    $
) {
    function HeatmapView(domainObject, openmct) {
        this.domainObject = domainObject;
        this.openmct = openmct;
    }

    HeatmapView.prototype.show = function (container) {
        var $canvas = $("<canvas>");
        var renderer = new HeatmapRenderer($canvas[0], new HeatmapColors());
        var model = new HeatmapModel();
        var controller = new HeatmapController(model, renderer, this.openmct);

        this.unobserve = controller.observe(this.domainObject);

        $(container).append($canvas);
    };

    HeatmapView.prototype.destroy = function () {
        if (this.unobserve) {
            this.unobserve();
            delete this.unobserve;
        }
    };

    return HeatmapView;
});
