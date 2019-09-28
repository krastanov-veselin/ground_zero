'use strict';

class ListUI extends UI {
    constructor(...p) {
        super(...p);
        
        /** @type {ListPointer} */
        this.listPointer = null;
        this.sorting = false;
    }
    
    mounted() {
        this.listPointer = new ListPointer((performance.now() + "_" + this.random(1, 99999)), this.options.listID);
        /** @type {UI} */
        const itemClassReference = this.options.itemClassReference;
        
        if (this.listPointer.mounted === false) {
            this.listPointer.mount();
        }
        
        if (this.listPointer.mounted === false) {
            console.warn("Failed to mount listPointer[\"" + this.listPointer.listID + "\"]");
            
            return;
        }
        
        this.listPointer.onAdd = (id = "") => {
            const element = this.element(itemClassReference, this.listPointer.item(id), id);
            
            element.mount();
            
            this.node.node.appendChild(element.node.node);
        };
        
        this.listPointer.onRemove = (id = "") => {
            if (this.elements.has(id) === false) {
                console.warn("Trying to remove a nonexisting element.");
                
                return;
            }
            
            const element = this.elements.get(id);
            
            element.unmount();
        };
        
        this.listPointer.onSort = (elementID1 = "", elementID2 = "", type = 0) => {
            if (this.sorting) {
                return;
            }
            
            if (type === 0) {
                this.elements.get(elementID1).node.node.before(this.elements.get(elementID2).node.node);
            } else {
                this.elements.get(elementID1).node.node.after(this.elements.get(elementID2).node.node);
            }
        };
        
        this.listPointer.list.items.forEach((item = new Item(), id = "") => {
            const element = this.element(itemClassReference, item, id);
            
            element.mount();
            
            this.node.node.appendChild(element.node.node);
        });
    }
    
    onUnmount(unmount = () => {}) {
        this.listPointer.unmount();
        
        unmount();
    }
    
    display() {
        return this.options.listNode;
    }
}
