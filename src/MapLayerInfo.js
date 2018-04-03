import Control from 'ol/control/control';
import './styles/layer-info.css';

export default class MapLayerInfo extends Control {
    constructor(options) {
        if (!options) {
            options = {};
        }
        options.element = document.createElement('div');
        options.element.className = 'mct-map-layer-info ol-unselectable ol-control'
        let template = `
            <p class="mct-map-baselayer-info"></p>
            <p class="mct-map-heatmap-info"></p>
        `;
        options.element.innerHTML = template;
        super(options);
        this.baseLayerElement = options.element.querySelector('.mct-map-baselayer-info');
        this.heatmapElement = options.element.querySelector('.mct-map-heatmap-info');
        this.setBaseLayer();
        this.setHeatmap();
    }
    setBaseLayer(baseLayer) {
        if (!baseLayer) {
            this.baseLayerElement.innerHTML = 'Base: none';
            return;
        }
        this.baseLayerElement.innerHTML = `Base: ${
            baseLayer.getProperties().name
        }`;
    }
    setHeatmap(heatmapLayer) {
        if (!heatmapLayer) {
            this.heatmapElement.innerHTML = 'Heat Map: none';
            return;
        }
        this.heatmapElement.innerHTML = `Heat Map: ${
            heatmapLayer.getProperties().name
        }`;
    }
};
