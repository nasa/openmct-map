import TraverseView from './TraverseView';
import OpenLayersMapView from './OpenLayersMapView';

export default function mapPlugin(options) {
    return function (openmct) {
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
                    control: "textarea",
                    required: true,
                    cssClass: "l-textarea-sm"
                }
            ]
        });

        openmct.objectViews.addProvider({
            key: 'traverse',
            canView: function (domainObject) {
                return domainObject.type === 'view.traverse';
            },
            view: function (domainObject) {
                return new TraverseView(domainObject, new OpenLayersMapView());
            }
        });
    };
};
