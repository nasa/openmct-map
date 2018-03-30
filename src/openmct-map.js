import MapView from './MapView';
import LocationTelemetryPlugin from './LocationTelemetryPlugin';
import LocationMeasurementTelemetryPlugin from './LocationMeasurementTelemetryPlugin';

export default function mapPlugin(options) {
    return function (openmct) {
        function JSONController($scope) {
            $scope.jsonText = JSON.stringify($scope.ngModel[$scope.field], null, 4);
            $scope.$watch("jsonText", function (value) {
                try {
                    $scope.ngModel[$scope.field] =
                        JSON.parse(value);
                    $scope.ngModelController.$setValidity('json', true);
                } catch (e) {
                    $scope.ngModelController.$setValidity('json', false);
                }
            });
        }

        openmct.legacyExtension("controllers", {
            key: "JSONController",
            implementation: function ($scope) {
                return new JSONController($scope);
            },
            depends: ["$scope"]
        });

        openmct.legacyExtension("controls", {
            key: "json",
            template: "<code ng-controller='JSONController' class='l-textarea-lg'><textarea ng-model='jsonText'></textarea></code>"
        });

        openmct.types.addType('view.traverse', {
            name: 'Traverse Map',
            description: 'A visualization of a rover traverse.',
            key: 'view.traverse',
            cssClass: 'icon-object',
            creatable: true,
            initialize: function (obj) {
                obj.layers = [];
                obj.width = 1200;
                obj.height = 1200;
                obj.xOffset = -600;
                obj.yOffset = -600;
            },
            form: [
                {
                    key: "width",
                    name: "Map Width, meters",
                    control: "numberfield",
                    required: true
                },
                {
                    key: "height",
                    name: "Map Height, meters",
                    control: "numberfield",
                    required: true
                },
                {
                    key: "xOffset",
                    name: "X Offset",
                    control: "numberfield",
                    required: true
                },
                {
                    key: "yOffset",
                    name: "yOffset",
                    control: "numberfield",
                    required: true
                },
                {
                    key: "layers",
                    name: "Layers (JSON array)",
                    control: "json",
                    required: true,
                    cssClass: "l-textarea-sm"
                },
                {
                    key: "followPosition",
                    name: "Camera Follow location",
                    control: "textfield"
                }
            ]
        });
        openmct.objectViews.addProvider({
            key: 'traverse',
            canView: function (domainObject) {
                return domainObject.type === 'view.traverse';
            },
            view: function (domainObject) {
                return new MapView(
                    domainObject,
                    openmct
                );
            }
        });

        openmct.install(LocationTelemetryPlugin);
        openmct.install(LocationMeasurementTelemetryPlugin);
    };
};
