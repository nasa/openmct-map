export default function LocationTelemetryPlugin(openmct) {

    function isNegation(idString) {
        return idString[0] === '-';
    }

    function getLocationObject(idString) {
        if (isNegation(idString)) {
            idString = idString.substring(1);
        }
        return openmct.objects.get(idString);
    }

    function negateIfRequired(idString, value) {
        if (isNegation(idString)) {
            return -value;
        }
        return value;
    }

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
                        format: timeSystem.timeFormat,
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

            var xPromise = getLocationObject(domainObject.xSource)
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

            var yPromise = getLocationObject(domainObject.ySource)
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
            var telem = {};
            var done = false;
            var unsubscribes = [];

            function sendUpdate() {
                if (done) {
                    return;
                }
                if (!telem.y.latest || !telem.x.latest) {
                    return;
                }
                if (telem.y.latestTimestamp !== telem.x.latestTimestamp) {
                    return;
                }
                var datum = {
                    x: negateIfRequired(domainObject.xSource, telem.x.coordFormat.parse(telem.x.latest)),
                    y: negateIfRequired(domainObject.ySource, telem.y.coordFormat.parse(telem.y.latest))
                }
                datum[openmct.time.timeSystem().key] = Math.max(
                    telem.x.latestTimestamp,
                    telem.y.latestTimestamp
                );
                delete telem.x.latest;
                delete telem.y.latest;
                delete telem.x.latestTimestamp;
                delete telem.y.latestTimestamp;
                callback(datum);
            }

            getLocationObject(domainObject.xSource)
                .then(function (xObject) {
                    if (done) {
                        return;
                    }
                    telem.x = {
                        object: xObject
                    };
                    var metadata = openmct.telemetry.getMetadata(xObject);
                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telem.x.coordFormat = openmct.telemetry.getValueFormatter(valueMeta);
                    telem.x.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(openmct.time.timeSystem().key));
                    unsubscribes.push(openmct.telemetry.subscribe(xObject, function (datum) {
                        telem.x.latest = datum;
                        telem.x.latestTimestamp = telem.x.timestampFormat.parse(datum);
                        sendUpdate();
                    }));
                });

            getLocationObject(domainObject.ySource)
                .then(function (yObject) {
                    if (done) {
                        return;
                    }
                    telem.y = {
                        object: yObject
                    };
                    var metadata = openmct.telemetry.getMetadata(yObject);
                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telem.y.coordFormat = openmct.telemetry.getValueFormatter(valueMeta);
                    telem.y.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(openmct.time.timeSystem().key));
                    unsubscribes.push(openmct.telemetry.subscribe(yObject, function (datum) {
                        telem.y.latest = datum;
                        telem.y.latestTimestamp = telem.y.timestampFormat.parse(datum);
                        sendUpdate();
                    }));
                });

            return function unsubscribe() {
                done = true;
                unsubscribes.forEach(function (u) {
                    u();
                });
                unsubscribes = undefined;
            };
        }
    });




};
