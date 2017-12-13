define([
    'vue',
    './HeatmapColors',
    './HeatmapController',
    './HeatmapModel',
    './HeatmapRenderer',
    './heatmap.html',
    './heatmap.scss'
], function (
    Vue,
    HeatmapColors,
    HeatmapController,
    HeatmapModel,
    HeatmapRenderer,
    heatmapTemplate
) {
    Vue = Vue.default || Vue;

    function HeatmapView(domainObject, openmct, document) {
        this.domainObject = domainObject;
        this.openmct = openmct;
        this.document = document;
    }

    HeatmapView.prototype.show = function (container) {
        var self = this;
        var data = {
            xTicks: [],
            yTicks: [],
            legendTicks: [],
            xTickStyle: "",
            yTickStyle: "",
            legendTickStyle: "",
            low: this.domainObject.low,
            high: this.domainObject.high
        };
        var vue = new Vue({
            el: container,
            template: heatmapTemplate,
            data: data,
            mounted: function () {
                this.$nextTick(function () {
                    var canvas = vue.$refs.heatmap_grid;
                    var legend = vue.$refs.heatmap_legend;
                    var colors = new HeatmapColors(+self.domainObject.low, +self.domainObject.high);
                    var renderer = new HeatmapRenderer(canvas, legend, colors);
                    var model = new HeatmapModel(self.domainObject.gridSize);

                    self.controller = new HeatmapController(
                        data,
                        model,
                        renderer,
                        self.domainObject,
                        self.openmct
                    );

                    canvas.width = canvas.height = 1000; // Todo: change this to use .innerHeight/width of container
                });
            }
        });
    };

    HeatmapView.prototype.destroy = function () {
        if (this.controller) {
            this.controller.destroy();
            delete this.controller;
        }
    };

    return HeatmapView;
});
