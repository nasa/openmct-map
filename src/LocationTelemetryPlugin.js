export default function LocationTelemetryPlugin(openmct) {

    openmct.types.addType('telemetry.location-combiner', {
        name: 'Location Telemetry',
        description: `Combines telemetry from multiple sources to produce
timestamped x, y, z coordinate telemetry.`,
        cssClass: 'icon-object',
        creatable: true,
        initialize: function (obj) {
            obj.timeTolerance = 0;
            obj.telemetry = {};
        },
        form: [
            {
                key: "xSource",
                name: "X Coordinate Source",
                control: "textfield",
                required: true,
                cssClass: "l-textarea-sm"
            },
            {
                key: "ySource",
                name: "Y Coordinate Source",
                control: "textfield",
                required: true,
                cssClass: "l-textarea-sm"
            },
            {
                key: "zSource",
                name: "Z Coordinate Source (optional)",
                control: "textfield",
                cssClass: "l-textarea-sm"
            },
            {
                key: "timeTolerance",
                name: "Time Tolerance (zero if points will have identical timestamps)",
                control: "numberfield"
            }
        ]
    });

    openmct.telemetry.addProvider({
        supportsMetadata: function (domainObject) {
            return domainObject.type === 'telemetry.location-combiner';
        },
        getMetadata: function (domainObject) {
            var metadata = {}
            metadata.values = openmct
                .time
                .getAllTimeSystems()
                .map(function (timeSystem, i) {
                    return {
                        name: timeSystem.name,
                        key: timeSystem.key,
                        format: timeSystem.format,
                        hints: {domain: i}
                    };
                });
            metadata.values.push({
                name: 'X',
                key: 'x',
                hints: {xCoordinate: 1}
            });
            metadata.values.push({
                name: 'Y',
                key: 'y',
                hints: {yCoordinate: 1}
            });
            if (domainObject.zSource) {
                metadata.values.push({
                    name: 'Z',
                    key: 'z',
                    hints: {zCoordinate: 1}
                })
            }
            return metadata;
        },
        supportsRequest: function (domainObject) {
            return domainObject.type === 'telemetry.location-combiner';
        },
        request: function (domainObject, options) {
            var telemResults = {};

            var xPromise = openmct.objects.get(domainObject.xSource)
                .then(function (xObject) {
                    telemResults.x = {
                        object: xObject
                    };
                    var metadata = openmct.telemetry.getMetadata(xObject);
                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telemResults.x.coordFormat = openmct.telemetry.getValueFormatter(valueMeta);
                    telemResults.x.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(options.domain));
                    return openmct
                        .telemetry
                        .request(xObject, options)
                        .then(function (data) {
                            telemResults.x.data = data;
                        });
                });

            var yPromise = openmct.objects.get(domainObject.ySource)
                .then(function (yObject) {
                    telemResults.y = {
                        object: yObject
                    };
                    var metadata = openmct.telemetry.getMetadata(yObject);
                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telemResults.y.coordFormat = openmct.telemetry.getValueFormatter(valueMeta);
                    telemResults.y.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(options.domain));
                    return openmct
                        .telemetry
                        .request(yObject, options)
                        .then(function (data) {
                            telemResults.y.data = data;
                        });
                });

            return Promise.all([xPromise, yPromise])
                .then(function () {
                    var results = [];
                    var xByTime = telemResults.x.data.reduce(function (m, datum) {
                        m[telemResults.x.timestampFormat.parse(datum)] = telemResults.x.coordFormat.parse(datum);
                        return m;
                    }, {});
                    telemResults.y.data.forEach(function (datum) {
                        var timestamp = telemResults.y.timestampFormat.parse(datum);
                        if (xByTime[timestamp]) {
                            var resultDatum = {
                                x: xByTime[timestamp],
                                y: telemResults.y.coordFormat.parse(datum)
                            };
                            resultDatum[options.domain] = timestamp;
                            results.push(resultDatum);
                        }
                    });
                    return results;
                });
        },
        supportsSubscribe: function (domainObject) {
            return domainObject.type === 'telemetry.location-combiner';
        },
        subscribe: function (domainObject, callback) {
            // TODO: subscribe to both and merge points as they arrive.
            var latest = {};
            // var metas
            // function updateX(datum);
            return function unsubscribe() {
            };
        }
    });




};
