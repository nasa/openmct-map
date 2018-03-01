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
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import LineString from 'ol/geom/linestring';

export default class OpenLayersMapView {
    constructor() {
        this.map = new Map({
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    })
                })
            ],
            view: new View({
                projection: new Projection({
                    code: "none",
                    units: "m",
                    extent: [-2000, -2000, 2000, 2000]
                }),
                center: [0, 0],
                zoom: 2
            })
        });
    }

    show(element) {
        this.map.setTarget(element);
        this.map.render();
    }

    destroy() {
        this.map.destroy();
    }

    image(url, left, bottom, right, top) {
        this.map.addLayer(new ImageLayer({
            source: new ImageStatic({
                imageExtent: [left, bottom, right, top],
                url: url
            })
        }));
    }

    heatmap(coordinates, blur, radius) {
        this.map.addLayer(new Heatmap({
            source: new Vector({
                features: coordinates.map((coordinate) => {
                    let feature = new Feature({
                        geometry: new Point(coordinate)
                    });
                    feature.set('weight', coordinate[2]);
                    return feature;
                })
            }),
            blur: blur,
            radius: radius
        }));
    }

    line(coordinates) {
        this.map.addLayer(new VectorLayer({
            source: new Vector({
                features: [new Feature({
                    geometry: new LineString(coordinates)
                })]
            })
        }));
    }

    point(coordinate) {
        this.map.addLayer(new VectorLayer({
            source: new Vector({
                features: [new Feature({
                    geometry: new Point(coordinate)
                })]
            })
        }));
    }

    coordinate(event) {
        return this.map.getEventCoordinate(event);
    }

    opacity(index, value) {
        this.map.getLayers().getArray()[index].setOpacity(value);
    }
}