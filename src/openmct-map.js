import Cesium from "cesium/Cesium";
import "cesium/Widgets/widgets.css";

const MAP_TYPE = 'view.traverse';

class CesiumView {
    constructor() {

    }

    show(container) {
        new Cesium.Viewer(container);
    }

    destroy() {

    }
}

export default function mapPlugin(options) {
    return function (openmct) {
        openmct.types.addType(MAP_TYPE, {
            name: 'Traverse Map',
            description: 'A visualization of a rover traverse.',
            key: MAP_TYPE,
            cssClass: 'icon-object',
            creatable: true,
            initialize: function (obj) {
                obj.layers = [];
            }
        });

        (openmct.mainViews || openmct.objectViews).addProvider({
            key: "map",
            name: "Heat Map",
            canView: function (domainObject) {
                return domainObject.type === MAP_TYPE;
            },
            view: function (domainObject) {
                return new CesiumView(domainObject);
            }
        });
    };
};
