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
    if (options.cesiumBaseUrl) {
        window.CESIUM_BASE_URL = options.cesiumBaseUrl;
    }
    return function (openmct) {
        openmct.types.addType(MAP_TYPE, {
            name: 'Traverse Map',
            description: 'A visualization of a rover traverse.',
            key: MAP_TYPE,
            cssClass: 'icon-object',
            creatable: true,
            initialize: function (obj) {
                obj.layers = [];
            },
            form: [
                {
                    key: "left",
                    name: "Left X",
                    control: "textfield",
                    required: true
                },
                {
                    key: "top",
                    name: "Top Y",
                    control: "textfield",
                    required: true
                },
                {
                    key: "right",
                    name: "Right X",
                    control: "textfield",
                    required: true
                },
                {
                    key: "bottom",
                    name: "Bottom Y",
                    control: "textfield",
                    required: true
                },                {
                    key: "left",
                    name: "Left X",
                    control: "textfield",
                    required: true
                },
                {
                    key: "x",
                    name: "X Telemetry",
                    control: "textfield",
                    required: true
                },
                {
                    key: "y",
                    name: "y Telemetry",
                    control: "textfield",
                    required: true
                }
            ]
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
