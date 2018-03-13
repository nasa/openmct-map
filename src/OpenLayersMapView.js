import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
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

import EventEmitter from 'eventemitter3';

export default class OpenLayersMapView extends EventEmitter {
    constructor() {
        super();
        this.map = new Map({
            view: new View({
                projection: new Projection({
                    code: "none",
                    units: "m",
                    extent: [0, 0, 700000, 1300000]
                }),
                center: [47.111813945130351, 87.497173457505312],
                zoom: 26
            })
        });
    }

    show(element) {
        let select = new Select({ hitTolerance: 10 });
        this.map.setTarget(element);
        this.map.render();
        this.map.addInteraction(select);
        select.on('select', (e) => console.log(e));
    }

    destroy() {
        delete this.map;
    }

    image(url, left, bottom, right, top) {
        this.map.addLayer(new ImageLayer({
            source: new ImageStatic({
                imageExtent: [left, bottom, right, top],
                url: url
            })
        }));
    }

    traverse(url) {
        this.map.addLayer(new VectorLayer({
            source: new Vector({ url: url, format: new KML() })
        }));
    }

    heatmap() {
        let source = new Vector({ features: [] });
        this.map.addLayer(new Heatmap({
            source: source,
            blur: 5,
            radius: 10
        }));
        return {
            add(datum) {
                let feature = new Feature({
                    geometry: new Point([datum.x, datum.y, datum.z])
                });
                feature.set('weight', datum.z);
                source.addFeature(feature);
            },
            reset: source.clear.bind(source)
        };
    }

    line() {
        let geometry = new LineString([]);
        this.map.addLayer(new VectorLayer({
            source: new Vector({
                features: [new Feature({ geometry: geometry })]
            })
        }));
        return {
            add: (datum) => geometry.appendCoordinate([datum.x, datum.y]),
            reset: () => geometry.setCoordinates([])
        };
    }

    point() {
        let point = new Point([47.111813945130351, 87.497173457505312]);
        this.map.addLayer(new VectorLayer({
            source: new Vector({
                features: [new Feature({ geometry: point })]
            })
        }));
        return {
            add: (datum) => point.setCoordinates([datum.x, datum.y]),
            reset: () => point.setCoordinates([])
        };
    }

    points() {
        let source = new Vector({ features: [] });
        let layer = new VectorLayer({ source });
        this.map.addLayer(layer);
        return {
            add: (datum) => source.addFeature(new Feature({ geometry: new Point([datum.x, datum.y])})),
            reset: () => source.clear()
        };
    }


    camera() {
        let center = this.map.getView().getCenter();
        return {
            add: (datum) => this.map.getView().setCenter([datum.x, datum.y]),
            reset: () => this.map.getView().setCenter(center)
        };
    }

    coordinate(event) {
        return this.map.getEventCoordinate(event);
    }

    opacity(index, value) {
        this.map.getLayers().getArray()[index].setOpacity(value);
    }
}