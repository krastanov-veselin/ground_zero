'use strict';

class Item extends Ground {
    constructor(id = "", data = {}) {
        super();
        
        this.id = id;
        this.data = data;
        /** @type {Map<string, Pointer[]>} */
        this.pointers = new Map();
    }
    
    update(prop = "", newValue = null) {
        const oldValue = this.data[prop];
        
        this.data[prop] = newValue;
        
        this.broadcast(prop, newValue, oldValue);
    }
    
    broadcast(prop, newValue, oldValue) {
        if (this.pointers.has(prop) === false) {
            return;
        }
        
        const pointers = this.pointers.get(prop);
        
        for (let i = 0; i < pointers.length; i++) {
            pointers[i].onUpdate(newValue, oldValue);
        }
    }
}
