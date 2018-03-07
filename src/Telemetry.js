import EventEmitter from "eventemitter3";

export default class Telemetry extends EventEmitter {
    constructor(openmct, ids) {
        this.openmct = openmct;
        this.ids = ids;
        this.metadata = {};
        this.unsubscribes = {};
    }
    
    activate() {
        let properties = Object.keys(this.ids);
        let bounds = this.openmct.time.bounds();  
        let data = {};
        this.emit('reset');
        this.loading = true;        
        Promise.all(properties.map(function (property) {
            let idParts = domainObject[property].split(":");
            let identifier = idParts.length > 1 ?
                { namespace: idParts[0], key: idParts[1] } : idParts[0];   
            let add = this.add.bind(this, property);             
            return this.openmct.objects.get(identifer).then(function (object) {                
                this.metadata[property] = 
                    this.openmct.telemetry.getMetadata(obj);
                this.unsubscribes[property] =
                    this.openmct.telemetry.subscribe(object, add);
                this.requests[property] =
                    this.openmct.telemetry.request(object, bounds);
            });
        }, this)).then(function () {
            return Promise.all(properties.map(function (property) {
                return this.requests[property].then(function (series) {
                    data[property] = series;
                })
            }))
        }.bind(this)).then(function () {
            this.loading = false;
            // Add all the historical data
            
            // Add all pending realtime data
            this.queue.forEach(function (pending) {
                this.add(pending.property, pending.datum);
            }, this);
        }.bind(this));
    }
    
    add(property, datum) {
        if (this.loading) {
            this.queue.push({ property, datum });
        } else {
            // Add datum, emit event if appropriate
        }
    }
    
    destroy() {
        Object.keys(this.unsubscribes).forEach(function (property) {
            unsubscribes[property]();
        });
    }    
}