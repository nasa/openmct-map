import LayerFactory from './LayerFactory';
import TraverseView from './TraverseView';
import OpenLayersMapView from './OpenLayersMapView';

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

        let isDatum = (selected) => selected.context.item.type === 'datum';
        openmct.inspectorViews.addProvider({
            key: "map-feature",
            name: 'Features',
            canView: (selection) => selection.some(isDatum),
            view(selection) {
                return {
                    show(container) {
                        let ul = document.createElement('ul');
                        selection.filter(isDatum)
                            .map((selected) => selected.context.item.datum)
                            .forEach((datum) => {
                                let li = document.createElement('li');
                                let dl = document.createElement('dl');
                                Object.keys(datum).forEach((key) => {
                                    let dt = document.createElement('dt');
                                    let dd = document.createElement('dd');
                                    dt.textContent = key;
                                    dd.textContent = datum[key];
                                    dl.appendChild(dt);
                                    dl.appendChild(dd);
                                });
                                li.appendChild(dl);
                                ul.appendChild(li);
                            });
                        container.appendChild(ul);
                    },
                    destroy() {
                    }
                };
            }
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

        let layerFactory = new LayerFactory(openmct);
        openmct.objectViews.addProvider({
            key: 'traverse',
            canView: function (domainObject) {
                return domainObject.type === 'view.traverse';
            },
            view: function (domainObject) {
                return new TraverseView(
                    domainObject,
                    OpenLayersMapView,
                    layerFactory,
                    openmct.selection
                );
            }
        });
    };
};
