import Control from 'ol/control/control';
import './styles/controls.css';

export default class MapControls extends Control {
    constructor(options) {
        if (!options) {
            options = {};
        }
        options.element = document.createElement('div');
        options.element.className = 'mct-map-controls ol-unselectable ol-control'
        let template = `
            <button title="Cycle Active Heatmap" class="mct-map-select-heatmap">H</button>
            <button title="Cycle Active Baselayer" class="mct-map-select-baselayer">B</button>
        `;
        if (options.map && options.map.canFollow()) {
            template += `<button title="Follow/Unfollow Rover"class="mct-map-follow-rover">F</button>`;
        }
        options.element.innerHTML = template;
        super(options);
        this.baseLayers = options.baseLayers;
        this.heatmapLayers = options.heatmapLayers;
        this.map = options.map;
        this.heatmapButton = options.element.querySelector('.mct-map-select-heatmap');
        this.baselayerButton = options.element.querySelector('.mct-map-select-baselayer');
        this.followButton = options.element.querySelector('.mct-map-follow-rover');

        this.heatmapButton.onclick = () => {
            if (this.heatmapLayers.length === 0) {
                return;
            }
            let isActive = false;
            let active = undefined;
            for (var i = 0; i < this.heatmapLayers.length; i++) {
                if (this.heatmapLayers[i].getVisible()) {
                    isActive = true;
                    active = i;
                    break;
                }
            }
            if (!isActive) {
                this.heatmapLayers[0].setVisible(true);
                return false;
            }
            this.heatmapLayers[i].setVisible(false);
            if (this.heatmapLayers[i+1]) {
                this.heatmapLayers[i+1].setVisible(true);
            }
            return false;
        }
        this.baselayerButton.onclick = () => {
            if (this.baseLayers.length === 0) {
                return;
            }
            let isActive = false;
            let active = undefined;
            for (var i = 0; i < this.baseLayers.length; i++) {
                if (this.baseLayers[i].getVisible()) {
                    isActive = true;
                    active = i;
                    break;
                }
            }
            if (!isActive) {
                this.baseLayers[0].setVisible(true);
                return false;
            }
            this.baseLayers[i].setVisible(false);
            if (this.baseLayers[i+1]) {
                this.baseLayers[i+1].setVisible(true);
            }
            return false;
        }
        if (this.followButton) {
            this.followButton.onclick = () => {
                this.map.follow(!this.map.follow());
                return false;
            }
        }
    }
};
