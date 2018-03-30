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
import Draw from 'ol/interaction/draw';
import condition from 'ol/events/condition';
import extent from 'ol/extent';

import EventEmitter from 'eventemitter3';

export default class OpenLayersMapView extends EventEmitter {
    constructor() {
        super();
        this.extent = [-600, -600, 600, 600];
        this.projection = new Projection({
            code: "baselayer_pixels",
            units: "pixels",
            extent: this.extent
        });
    }

    show(element) {

        this.map = new Map({
            view: new View({
                projection: this.projection,
                center: [0, 0],
                zoom: 2,
                maxRoom: 8
            }),
            layers: [
                new ImageLayer({
                    source: new ImageStatic({
                        imageExtent: this.extent,
                        url: '/ortho1200m.png',
                        projection: this.projection
                    })
                })
            ],
            center: extent.getCenter(this.extent),
            target: element
        });

        // this.map.addLayer();

        // let select = new Select({ hitTolerance: 10 });
        // let source = new Vector({ features: [] });
        // let draw = new Draw({ source, type: 'Point', condition: condition.altKeyOnly });
        // this.map.addLayer(new VectorLayer({ source }));
        // this.map.setTarget(element);
        // this.map.render();
        //
        // this.map.addInteraction(select);
        // this.map.addInteraction(draw);
        //
        // draw.on('drawend', function (event) {
        //     let coordinates = event.feature.getGeometry().getCoordinates();
        //     event.feature.set('datum', { x: coordinates[0], y: coordinates[1] });
        // });
        //
        // select.on('select', (e) => this.emit(
        //     'select',
        //     e.selected.map((e) => e.get('datum'))
        // ));
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

    heatmap(blur, radius, gradient, weight) {
        let source = new Vector({ features: [] });
        this.map.addLayer(new Heatmap({ source, blur, radius, gradient, weight }));
        return {
            add(datum) {
                let feature = new Feature({
                    geometry: new Point([datum.x, datum.y, datum.z]),
                    datum: datum
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
        this.map.addLayer(new VectorLayer({ source }));
        return {
            add: (datum) => source.addFeature(new Feature({
                geometry: new Point([datum.x, datum.y]),
                datum: datum
            })),
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
