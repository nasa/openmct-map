import Control from 'ol/control/control';
import './styles/controls.css';

export default class MapControls extends Control {
    constructor(options) {
        if (!options) {
            options = {};
        }
        options.element = document.createElement('div');
        options.element.className = 'mct-map-controls ol-unselectable ol-control l-btn-set'
        let template = `
            <button title="Cycle Active Heatmap" class="mct-map-select-heatmap s-button">H</button>
            <button title="Cycle Active Baselayer" class="mct-map-select-baselayer s-button">B</button>
        `;
        if (options.map && options.map.canFollow()) {
            template += `<button title="Follow/Unfollow Rover"class="mct-map-follow-rover s-button">F</button>`;
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
                this.map.setHeatmap(this.heatmapLayers[0])
            } else {
                this.map.setHeatmap(this.heatmapLayers[i+1]);
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
                this.map.setBase(this.baseLayers[0]);
            } else {
                this.map.setBase(this.baseLayers[i+1]);
            }
            return false;
        }
        if (this.followButton) {
            this.followButton.onclick = () => {
                this.map.follow(!this.map.follow());
                if (this.map.follow()) {
                    this.followButton.className = 'mct-map-follow-rover s-button mct-map-follow-active';
                } else {
                    this.followButton.className = 'mct-map-follow-rover s-button';
                }
                return false;
            }
        }
    }
};
