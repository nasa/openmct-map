export default function LocationMeasurementTelemetryPlugin(openmct) {

    openmct.types.addType('telemetry.location-measurement-combiner', {
        name: 'Location Measurement Telemetry',
        description: `Combines telemetry from a location source and a measurement
from a telemetry channel so that measurements can be displayed on a map or in another fashion.`,
        cssClass: 'icon-telemetry',
        creatable: true,
        initialize: function (obj) {
            obj.timeTolerance = 0;
            obj.telemetry = {};
        },
        form: [
            {
                key: "locationSource",
                name: "Location Source",
                control: "textfield",
                required: true,
                cssClass: "l-textarea-sm"
            },
            {
                key: "measurementSource",
                name: "Measurement Source",
                control: "textfield",
                required: true,
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
            return domainObject.type === 'telemetry.location-measurement-combiner';
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
            metadata.values.push({
                name: 'measurement',
                key: 'measurement',
                hints: {range: 1}
            });
            return metadata;
        },
        supportsRequest: function (domainObject) {
            return domainObject.type === 'telemetry.location-measurement-combiner';
        },
        request: function (domainObject, options) {
            var telem = {};

            var locationPromise = openmct.objects.get(domainObject.locationSource)
                .then(function (locationObject) {
                    telem.location = {
                        object: locationObject
                    };
                    var metadata = openmct.telemetry.getMetadata(locationObject);
                    var xMeta = metadata.valuesForHints(['xCoordinate'])[0];
                    var yMeta = metadata.valuesForHints(['yCoordinate'])[0];

                    telem.location.xFormat = openmct.telemetry.getValueFormatter(xMeta);
                    telem.location.yFormat = openmct.telemetry.getValueFormatter(yMeta);
                    telem.location.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(options.domain));
                    return openmct
                        .telemetry
                        .request(locationObject, options)
                        .then(function (data) {
                            telem.location.data = data;
                        });
                });

            var measurementPromise = openmct.objects.get(domainObject.measurementSource)
                .then(function (measurementObject) {
                    telem.measurement = {
                        object: measurementObject
                    };
                    var metadata = openmct.telemetry.getMetadata(measurementObject);
                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telem.measurement.rangeFormat = openmct.telemetry.getValueFormatter(valueMeta);
                    telem.measurement.timestampFormat = openmct.telemetry.getValueFormatter(metadata.value(options.domain));
                    return openmct
                        .telemetry
                        .request(measurementObject, options)
                        .then(function (data) {
                            telem.measurement.data = data;
                        });
                });

            return Promise.all([locationPromise, measurementPromise])
                .then(function () {
                    var results = [];
                    var iL = 0;
                    var currLocation = telem.location.data[iL];
                    var currTimestamp = telem.location.timestampFormat.parse(currLocation);
                    var nextLocation = telem.location.data[iL + 1];
                    var nextTimestamp = telem.location.timestampFormat.parse(nextLocation);
                    for (var iM = 0; iM < telem.measurement.data.length; iM++) {
                        var measurement = telem.measurement.data[iM];
                        var measurementTimestamp = telem.measurement.timestampFormat.parse(measurement);
                        if (measurementTimestamp < currTimestamp) {
                            continue; // don't have location for it.
                        }

                        while (nextLocation && measurementTimestamp > nextTimestamp) {
                            // Advance until measurement is after current but before next.
                            iL++;
                            currLocation = telem.location.data[iL];
                            currTimestamp = telem.location.timestampFormat.parse(currLocation);
                            nextLocation = telem.location.data[iL + 1];
                            nextTimestamp = telem.location.timestampFormat.parse(nextLocation);
                        }
                        var resultData = {
                            x: telem.location.xFormat.parse(currLocation),
                            y: telem.location.yFormat.parse(currLocation),
                            measurement: telem.measurement.rangeFormat.parse(measurement)
                        };
                        resultData[options.domain] = measurementTimestamp;
                        results.push(resultData);
                    }
                    return results;
                });
        },
        supportsSubscribe: function (domainObject) {
            return domainObject.type === 'telemetry.location-measurement-combiner';
        },
        subscribe: function (domainObject, callback) {
            // TODO: subscribe to both and merge points as they arrive.
            var telem = {};
            var done = false;
            var unsubscribes = [];

            openmct.objects.get(domainObject.locationSource)
                .then(function (locationObject) {
                    if (done) {
                        return;
                    }
                    telem.location = {
                        object: locationObject
                    };
                    var metadata = openmct.telemetry.getMetadata(locationObject);
                    var xMeta = metadata.valuesForHints(['xCoordinate'])[0];
                    var yMeta = metadata.valuesForHints(['yCoordinate'])[0];
                    telem.location.xFormat = openmct.telemetry.getValueFormatter(xMeta);
                    telem.location.yFormat = openmct.telemetry.getValueFormatter(yMeta);

                    telem.location.timestampFormat = openmct
                        .telemetry
                        .getValueFormatter(metadata.value(openmct.time.timeSystem().key));

                    unsubscribes.push(openmct.telemetry.subscribe(locationObject, function (datum) {
                        telem.location.latest = datum;
                        telem.location.latestTimestamp = telem.location.timestampFormat.parse(datum);
                    }));
                });

            openmct.objects.get(domainObject.measurementSource)
                .then(function (measurementObject) {
                    if (done) {
                        return;
                    }
                    telem.measurement = {
                        object: measurementObject
                    };
                    var metadata = openmct
                        .telemetry
                        .getMetadata(measurementObject);

                    var valueMeta = metadata.valuesForHints(['range'])[0];
                    telem.measurement.rangeFormat = openmct
                        .telemetry
                        .getValueFormatter(valueMeta);

                    telem.measurement.timestampFormat = openmct
                        .telemetry
                        .getValueFormatter(metadata.value(openmct.time.timeSystem().key));

                    unsubscribes.push(openmct.telemetry.subscribe(measurementObject, function (datum) {
                        var timestamp = telem.measurement.timestampFormat.parse(datum);
                        if (done) {
                            return;
                        }
                        if (!telem.location.latest) {
                            return;
                        }
                        if (timestamp < telem.location.latestTimestamp) {
                            return;
                        }
                        var resultDatum = {
                            measurement: telem.measurement.rangeFormat.parse(datum),
                            x: telem.location.xFormat.parse(telem.location.latest),
                            y: telem.location.yFormat.parse(telem.location.latest),
                        };
                        resultDatum[openmct.time.timeSystem().key] = timestamp;
                        callback(resultDatum);
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
