requirejs.config({
    paths: {
        openmct: "node_modules/openmct/dist/openmct",
        text: "node_modules/requirejs-text/text",
        vue: "node_modules/vue/dist/vue.min"
    },
    map: {
        '*': {
            'sass': "node_modules/requirejs-style-plugins/sass"
        }
    }
});
