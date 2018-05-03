import 'ol/ol.css';
import './styles/popup.css';
import Map from 'ol/map';
import View from 'ol/view';
import Overlay from 'ol/overlay';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import Projection from 'ol/proj/projection';
import ImageLayer from 'ol/layer/image';
import VectorLayer from 'ol/layer/vector';
import ImageStatic from 'ol/source/imagestatic';
import Heatmap from 'ol/layer/heatmap';
import Collection from 'ol/collection';
import Vector from 'ol/source/vector';
import KML from 'ol/format/kml';
import Feature from 'ol/feature';
import Circle from 'ol/geom/circle';
import Point from 'ol/geom/point';
import MultiPoint from 'ol/geom/multipoint';
import LineString from 'ol/geom/linestring';
import TileWMS from 'ol/source/tilewms';
import Select from 'ol/interaction/select';
import Draw from 'ol/interaction/draw';
import condition from 'ol/events/condition';
import extent from 'ol/extent';
import control from 'ol/control';
import PointLayer from './PointLayer';
import TelemetryPointsLayer from './telemetry-layers/TelemetryPointsLayer';
import TelemetryPointLayer from './telemetry-layers/TelemetryPointLayer';
import TelemetryPathLayer from './telemetry-layers/TelemetryPathLayer';
import TelemetryHeatmapLayer from './telemetry-layers/TelemetryHeatmapLayer';
import TelemetryAverageHeatmapLayer from './telemetry-layers/TelemetryAverageHeatmapLayer';
import StaticPathLayer from './telemetry-layers/StaticPathLayer';
import MapControls from './MapControls';
import MapLayerInfo from './MapLayerInfo';
import DragPan from 'ol/interaction/dragpan';
import MouseWheelZoom from 'ol/interaction/mousewheelzoom';
import KeyboardPan from 'ol/interaction/keyboardpan';
import Zoom from 'ol/control/zoom';

const TEMPLATE = `<div class="mct-map abs"></div>
<div class="mct-heatmap-scale">
    <div class="mct-heatmap-scale-min"></div>
    <div class="mct-heatmap-scale-image"></div>
    <div class="mct-heatmap-scale-max"></div>
</div>
<div class="mct-map-popup">
    <a href="#" class="mct-map-popup-closer"></a>
    <div class="mct-map-popup-content"></div>
</div>`;

export default class MapView {
    constructor(domainObject, openmct) {
        this.domainObject = domainObject;
        this.openmct = openmct;
        this.extent = [
            0 + domainObject.xOffset,
            0 + domainObject.yOffset,
            domainObject.width + domainObject.xOffset,
            domainObject.height + domainObject.yOffset
        ]
        this.projection = new Projection({
            code: "baselayer_pixels",
            units: "pixels",
            extent: this.extent
        });
        this.layers = [];
        this.heatmapLayers = [];
        this.heatmaps = [];
        this.baseLayers = [];
        this.following = false;
    }

    show(element) {
        this.element = element;
        this.element.innerHTML = TEMPLATE;
        this.mapElement = element.querySelector('.mct-map');
        this.popupElement = element.querySelector('.mct-map-popup');
        this.popupCloser = element.querySelector('.mct-map-popup-closer');
        this.popupContent = element.querySelector('.mct-map-popup-content');

        this.heatmapScale = element.querySelector('.mct-heatmap-scale');
        this.heatmapScaleMin = element.querySelector('.mct-heatmap-scale-min');
        this.heatmapScaleMax = element.querySelector('.mct-heatmap-scale-max');
        this.heatmapScaleImage = element.querySelector('.mct-heatmap-scale-image');

        this.overlay = new Overlay({
            element: this.popupElement,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });

        this.popupCloser.onclick = () => {
            this.overlay.setPosition(undefined);
            this.popupCloser.blur();
            this.pointLayer.hide();
            return false;
        };

        this.layerInfo = new MapLayerInfo();

        let zoomControl = new Zoom({className: 'ol-zoom l-btn-set'});
        zoomControl.element.querySelectorAll('button').forEach((b) => {
            b.className += ' s-button';
        });

        this.map = new Map({
            controls: [
                zoomControl,
                new MapControls({
                    baseLayers: this.baseLayers,
                    heatmapLayers: this.heatmapLayers,
                    map: this
                }),
                this.layerInfo
            ],
            view: new View({
                projection: this.projection,
                center: [0, 0],
                zoom: 2,
                maxRoom: 8
            }),
            layers: [],
            overlays: [this.overlay],
            center: extent.getCenter(this.extent),
            target: this.mapElement
        });

        this.resizeTimer = setInterval(() => this.map.updateSize(), 1000);

        this.pointLayer = new PointLayer(this.map);

        this.map.on('singleclick', (event) => {
            // TODO: Fetch nearest feature and show in popup.
            let coord = event.coordinate;
            let x = coord[0];
            let y = coord[1];

            this.popupContent.innerHTML = `<p>Coordinates: </p>
                <input type="text" value="X: ${x.toFixed(4)}, Y: ${y.toFixed(4)}"/>`;

            this.overlay.setPosition(coord);
            this.pointLayer.move(x, y);
        });

        if (this.canFollow()) {
            this.trackPositionUpdates();
        }

        this.loadLayersFromObject(this.domainObject);
    }

    makeLayer(layerDefinition) {
        if (layerDefinition.type === 'path') {
            return new TelemetryPathLayer(this.map, layerDefinition, this.openmct);
        }
        if (layerDefinition.type === 'point') {
            return new TelemetryPointLayer(this.map, layerDefinition, this.openmct);
        }
        if (layerDefinition.type === 'points') {
            return new TelemetryPointsLayer(this.map, layerDefinition, this.openmct);
        }
        if (layerDefinition.type === 'heatmap') {
            var layer = new TelemetryHeatmapLayer(this.map, layerDefinition, this.openmct);
            this.heatmapLayers.push(layer.layer);
            this.heatmaps.push(layer);
            if (this.heatmapLayers.length > 1) {
                layer.layer.setVisible(false);
            } else {
                this.setHeatmap(layer.layer);
            }
            return layer;
        }
        if (layerDefinition.type === 'average-heatmap') {
            var layer = new TelemetryAverageHeatmapLayer(this.map, layerDefinition, this.openmct);
            this.heatmapLayers.push(layer.layer);
            this.heatmaps.push(layer);
            if (this.heatmapLayers.length > 1) {
                layer.layer.setVisible(false);
            } else {
                this.setHeatmap(layer.layer);
            }
            return layer;
        }
        if (layerDefinition.type === 'static-path') {
            return new StaticPathLayer(this.map, layerDefinition, this.openmct);
        }
        if (layerDefinition.type === 'image') {
            var layer = new ImageLayer({
                source: new ImageStatic({
                    imageExtent: this.extent,
                    url: layerDefinition.imageUrl,
                    projection: this.projection
                })
            });
            layer.setProperties({name: layerDefinition.name});
            this.map.addLayer(layer);
            this.baseLayers.push(layer);
            if (this.baseLayers.length > 1) {
                layer.setVisible(false);
            } else {
                this.setBase(layer);
            }
        }
    }

    loadLayersFromObject() {
        this.domainObject.layers.forEach((layerDefinition) => {
            let layer = this.makeLayer(layerDefinition);
            if (!layer) {
                return;
            }
            this.layers.push(layer);
        });
    }

    trackPositionUpdates() {
        // We use a TelemetyPointLayer so we don't have to reimplement
        // Time API listeners and such.
        this.positionLayer = new TelemetryPointLayer(this.map, {
            name: "Hidden position layer",
            source: this.domainObject.followPosition
        }, this.openmct);
        let oldAdd = this.positionLayer.add.bind(this.positionLayer);
        this.positionLayer.add = (datum) => {
            oldAdd(datum);
            let coordinate = this.positionLayer.point.getCoordinates();
            if (!coordinate) {
                return;
            }
            if (!this.positionLayer.loading) {
                this.setLastPosition(coordinate[0], coordinate[1]);
            }
        }
        let oldStopLoading = this.positionLayer.stopLoading.bind(this.positionLayer);
        this.positionLayer.stopLoading = () => {
            oldStopLoading();
            let coordinate = this.positionLayer.point.getCoordinates();
            if (!coordinate) {
                return;
            }
            this.setLastPosition(coordinate[0], coordinate[1]);
        }
        this.positionLayer.layer.setVisible(false);
    }

    setLastPosition(x, y) {
        this.lastPosition = [x, y];
        this.followIfActive();
    }

    followIfActive() {
        if (!this.following || !this.lastPosition) {
            return;
        }
        this.map
            .getView()
            .setCenter(this.lastPosition);
    }

    canFollow() {
        return this.domainObject.followPosition;
    }

    setBase(layer) {
        this.baseLayers.filter((l) => l.getVisible())
            .forEach((l) => l.setVisible(false));
        if (layer) {
            layer.setVisible(true);
        }
        this.layerInfo.setBaseLayer(layer);
    }

    setHeatmap(layer) {
        this.heatmapLayers.filter((l) => l.getVisible())
            .forEach((l) => l.setVisible(false));
        if (layer) {
            let mapLayer = this.heatmaps[this.heatmapLayers.indexOf(layer)];
            layer.setVisible(true);
            if (mapLayer.gradientCanvas) {
                this.heatmapScale.className = 'mct-heatmap-scale';
                this.heatmapScaleMin.innerHTML = mapLayer.low;
                this.heatmapScaleMax.innerHTML = mapLayer.high;
                this.heatmapScaleImage.innerHTML = '';
                this.heatmapScaleImage.appendChild(mapLayer.gradientCanvas);
            } else {
                this.heatmapScale.className = 'mct-heatmap-scale hide';
            }
        } else {
            this.heatmapScale.className = 'mct-heatmap-scale hide';
            this.heatmapScaleImage.innerHTML = '';
        }
        this.layerInfo.setHeatmap(layer);
    }


    /**
     * Set follow mode to given value.  If no value passed, returns current
     * follow mode.  When following, panning is disabled and mousewheel zoom
     * will be centered on rover.
     */
    follow(value) {
        if (arguments.length === 0) {
            return this.following;
        }
        this.following = value;
        let dragPan = this.map.getInteractions()
            .getArray()
            .filter((i) => i instanceof DragPan)[0];
        if (dragPan) {
            dragPan.setActive(!this.following);
        }
        let keyboardPan = this.map.getInteractions()
            .getArray()
            .filter((i) => i instanceof KeyboardPan)[0];
        if (keyboardPan) {
            keyboardPan.setActive(!this.following);
        }
        let mouseWheelZoom = this.map.getInteractions()
            .getArray()
            .filter((i) => i instanceof MouseWheelZoom)[0];
        if (mouseWheelZoom) {
            mouseWheelZoom.setMouseAnchor(!this.following);
        }
        this.followIfActive();
        return this.following;
    }

    destroy() {
        clearInterval(this.resizeTimer);
        this.map.setTarget(null);
        delete this.map;
        this.layers.forEach((layer) => layer.destroy());
        if (this.positionLayer) {
            this.positionLayer.destroy();
        }
    }
}
