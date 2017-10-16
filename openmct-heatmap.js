define([
    './src/HeatmapView'
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
                }
            });

            openmct.mainViews.addProvider({
                name: 'Heat Map',
                cssClass: 'icon-object',
                canView: function (d) {
                    return d.type === 'view.heatmap';
                },
                view: function (domainObject) {
                    return new HeatmapView(domainObject, openmct);
                }
            });
        };
    };
});
