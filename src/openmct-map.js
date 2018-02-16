export default function mapPlugin(options) {
    return function (openmct) {
        openmct.types.addType('view.traverse', {
            name: 'Traverse Map',
            description: 'A visualization of a rover traverse.',
            key: 'view.map',
            cssClass: 'icon-object',
            creatable: true,
            initialize: function (obj)
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
    };
};
