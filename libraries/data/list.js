'use strict';

class List extends Ground {
    constructor(id) {
        super();
        
        this.id = id;
        /** @type {Map<string, Item>} */
        this.items = new Map();
        /** @type {ListPointer[]} */
        this.pointers = [];
        /** @type {Map<string, boolean>} */
        this.appliedEventIDs = new Map();
    }
    
    add(structure = {}, id = "") {
        if (id.length === 0) {
            id = performance.now() + "_" + this.random(1, 99999);
        }
        
        this.items.set(id, new Item(id, structure));
        
        this.broadcastAdd(id);
    }
    
    remove(id = "") {
        this.items.delete(id);
        
        this.broadcastRemove(id);
    }
    
    sort(elementID1 = "", elementID2 = "", type = 0) {
        this.broadcastSort(elementID1, elementID2, type);
    }
    
    unmount() {
        this.broadcastUnmount();
    }
    
    broadcastAdd(id) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onAdd(id);
        }
    }
    
    broadcastRemove(id) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onRemove(id);
        }
    }
    
    broadcastSort(elementID1 = "", elementID2 = "", type = 0) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onSort(elementID1, elementID2, type);
        }
    }
    
    broadcastUnmount() {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onUnmount(id);
        }
    }
}
