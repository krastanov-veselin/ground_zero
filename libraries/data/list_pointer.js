'use strict';

class ListPointer extends Ground {
    constructor(
        eventID = "", 
        listID = "", 
        onAdd = () => {}, 
        onRemove = () => {}, 
        onSort = () => {},
        onUnmount = () => {}, 
        autoMount = true
    ) {
        super();
        
        this.eventID = eventID;
        this.listID = listID;
        this.onAdd = onAdd;
        this.onRemove = onRemove;
        this.onSort = onSort;
        this.onUnmount = onUnmount;
        this.mounted = false;
        /** @type {List} */
        this.list = null;
        
        if (autoMount) {
            this.mount();
        }
    }
    
    item(id = "") {
        if (this.list.items.has(id) === false) {
            return null;
        }
        
        return this.list.items.get(id);
    }
    
    add(structure = {}, id = "") {
        this.list.add(structure, id);
    }
    
    remove(id = "") {
        this.list.remove(id);
    }
    
    sort(elementID1 = "", elementID2 = "", type = 0) {
        this.list.sort(elementID1, elementID2, type);
    }
    
    mount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.appliedEventIDs.has(this.eventID)) {
            this.mounted = false;
            
            return;
        }
        
        list.pointers.push(this);
        list.appliedEventIDs.set(this.eventID, true);
        
        this.list = list;
        
        this.mounted = true;
    }
    
    unmount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.appliedEventIDs.has(this.eventID) === false) {
            this.mounted = false;
            
            return;
        }
        
        for (let i = 0; i < list.pointers.length; i++) {
            if (list.pointers[i].eventID === this.eventID) {
                list.pointers.splice(i, 1);
                
                break;
            }
        }
        
        list.appliedEventIDs.delete(this.eventID);
        
        this.list = null;
        
        this.mounted = false;
    }
}
