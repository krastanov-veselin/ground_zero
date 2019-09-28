'use strict';

class Pointer extends Ground {
    constructor(listID = "", itemID = "", prop = "", onUpdate = null, onUnmount = null, autoMount = true) {
        super();
        
        this.listID = listID;
        this.itemID = itemID;
        this.prop = prop;
        this.onUnmount = onUnmount;
        this.onUpdate = onUpdate;
        this.mounted = false;
        this.uniqueID = performance.now() + "_" + this.random(1, 99999);
        
        if (autoMount) {
            this.mount();
        }
    }
    
    get item() {
        return Data.lists.get(this.listID).items.get(this.itemID);
    }
    
    get value() {
        return this.item.data[this.prop];
    }
    
    set value(newValue = null) {
        if (this.mounted === false) {
            return;
        }
        
        this.item.update(this.prop, newValue);
    }
    
    update() {
        this.value = this.value;
    }
    
    broadcast() {
        this.item.broadcast();
    }
    
    mount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.items.has(this.itemID) === false) {
            this.mounted = false;
            
            return;
        }
        
        if (this.onUpdate !== null) {
            if (this.item.pointers.has(this.prop) === false) {
                this.item.pointers.set(this.prop, []);
            }
            
            this.item.pointers.get(this.prop).push(this);
        }
        
        this.mounted = true;
    }
    
    unmount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            this.item = null;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.items.has(this.itemID) === false) {
            this.mounted = false;
            this.item = null;
            
            return;
        }
        
        if (this.onUpdate !== null) {
            if (this.item.pointers.has(this.prop) === false) {
                this.mounted = false;
                this.item = null;
                
                return;
            }
            
            const siblings = this.item.pointers.get(this.prop);
            
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].uniqueID === this.uniqueID) {
                    siblings.splice(i, 1);
                    
                    break;
                }
            }
        }
        
        this.mounted = false;
    }
}
