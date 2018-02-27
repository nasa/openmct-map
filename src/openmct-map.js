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
            }
        });
    };
};
