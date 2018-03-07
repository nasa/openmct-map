import LayerFactory from './LayerFactory';
import TraverseView from './TraverseView';
import OpenLayersMapView from './OpenLayersMapView';

export default function mapPlugin(options) {
    return function (openmct) {
        function JSONController($scope) {
            $scope.jsonText = JSON.stringify($scope.ngModel[$scope.field]);
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
            template: "<code ng-controller='JSONController'><textarea ng-model='jsonText'></textarea></code>"
        });

        openmct.types.addType('view.traverse', {
            name: 'Traverse Map',
            description: 'A visualization of a rover traverse.',
            key: 'view.traverse',
            cssClass: 'icon-object',
            creatable: true,
            initialize: function (obj) {
                obj.layers = [];
            },
            form: [
                {
                    key: "layers",
                    name: "Layers",
                    control: "json",
                    required: true,
                    cssClass: "l-textarea-sm"
                }
            ]
        });

        let LayerFactory = new LayerFactory(openmct);
        openmct.objectViews.addProvider({
            key: 'traverse',
            canView: function (domainObject) {
                return domainObject.type === 'view.traverse';
            },
            view: function (domainObject) {
                return new TraverseView(domainObject, OpenLayersMapView, layerFactory);
            }
        });
    };
};
