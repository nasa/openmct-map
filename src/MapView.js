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
import TelemetryPathLayer from './telemetry-layers/TelemetryPathLayer';
import TelemetryHeatmapLayer from './telemetry-layers/TelemetryHeatmapLayer';
import StaticPathLayer from './telemetry-layers/StaticPathLayer';
import MapControls from './MapControls';


const TEMPLATE = `<div class="mct-map abs"></div>
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

        this.map = new Map({
            controls: control.defaults({attribution: false}).extend([
                new MapControls({
                    baseLayers: this.baseLayers,
                    heatmapLayers: this.heatmapLayers,
                    map: this
                })
            ]),
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
        if (layerDefinition.type === 'points') {
            return new TelemetryPointsLayer(this.map, layerDefinition, this.openmct);
        }
        if (layerDefinition.type === 'heatmap') {
            var layer = new TelemetryHeatmapLayer(this.map, layerDefinition, this.openmct);
            this.heatmapLayers.push(layer.layer);
            if (this.heatmapLayers.length > 1) {
                layer.layer.setVisible(false);
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
            this.map.addLayer(layer);
            this.baseLayers.push(layer);
            if (this.baseLayers.length > 1) {
                layer.setVisible(false);
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
        this.openmct.objects.get(this.domainObject.followPosition)
            .then((followObject) => {
                if (!this.map) {
                    return; // leave if destroyed.
                }
                let metadata = this.openmct.telemetry.getMetadata(followObject);
                let xMeta = metadata.valuesForHints(['xCoordinate'])[0];
                let yMeta = metadata.valuesForHints(['yCoordinate'])[0];
                let xFormat = this.openmct.telemetry.getValueFormatter(xMeta);
                let yFormat = this.openmct.telemetry.getValueFormatter(yMeta);
                this.unsubscribe = this
                    .openmct
                    .telemetry
                    .subscribe(followObject, (datum) => {
                        this.setLastPosition(xFormat.parse(datum), yFormat.parse(datum));
                    });
            });
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

    follow(value) {
        if (arguments.length === 0) {
            return this.following;
        }
        this.following = value;
        this.followIfActive();
        return this.following;
    }

    destroy() {
        this.map.setTarget(null);
        delete this.map;
        this.layers.forEach((layer) => layer.destroy());
        if (this.unsubscribe) {
            this.unsubscribe();
            delete this.unsubscribe;
        }
    }
}
