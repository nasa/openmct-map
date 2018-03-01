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
import Point from 'ol/geom/point';
import LineString from 'ol/geom/linestring';
import TileWMS from 'ol/source/tilewms';
import proj4 from 'proj4';

proj4.defs(
    "EPSG:3996",
    "+proj=stere +lat_0=90 +lat_ts=75 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);

export default class OpenLayersMapView {
    constructor() {
        this.map = new Map({
            view: new View({
                projection: new Projection({
                    code: "EPSG:3996",
                    units: "m",
                    extent: [0, 0, 700000, 1300000]
                }),
                center: [-47.111813945130351, 87.497173457505312],
                zoom: 28
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

    traverse(url) {
        this.map.addLayer(new VectorLayer({
            source: new Vector({ url: url, format: new KML() })
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