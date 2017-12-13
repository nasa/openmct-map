define([
    './HeatmapView'
], function (
    HeatmapView
) {
    return function HeatmapPlugin(options) {
        return function install(openmct) {
            openmct.types.addType('view.heatmap', {
                name: 'Heat Map',
                description: 'A visualization of counts at x and y positions.',
                key: 'view.heatmap',
                cssClass: 'icon-object',
                creatable: true,
                initialize: function (obj) {
                },
                form: [
                    {
                        key: "x",
                        name: "X",
                        control: "textfield",
                        required: true
                    },
                    {
                        key: "y",
                        name: "Y",
                        control: "textfield",
                        required: true
                    },
                    {
                        key: "counts",
                        name: "Counts",
                        control: "textfield",
                        required: true
                    },
                    {
                        key: "low",
                        name: "Low value",
                        control: "textfield",
                        required: true
                    },
                    {
                        key: "high",
                        name: "High value",
                        control: "textfield",
                        required: true
                    },
                    {
                        key: "gridSize",
                        name: "Grid size",
                        control: "textfield",
                        required: true
                    }
                ]
            });

            (openmct.mainViews || openmct.objectViews).addProvider({
                name: 'Heat Map',
                key: 'heatmap',
                cssClass: 'icon-object',
                canView: function (d) {
                    return d.type === 'view.heatmap';
                },
                view: function (domainObject) {
                    return new HeatmapView(domainObject, openmct, document);
                }
            });
        };
    };
});
