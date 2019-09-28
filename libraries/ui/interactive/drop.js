/**
 * Features to be applied
 * ~1. Can drop item's data
 * 2. Can be combined with sort to automatically adjust where to appear the new item
 * 3. When combined with sort to have oninsert method which handles the data insertion and it's processing
 * 
*/

class Drop extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
        
        /** @type {Array<<Struct>>} */
        this._accept = [];
        this._onDropBinded = null;
        this._onDragEnterBinded = null;
        this._onDragLeaveBinded = null;
        this.sortElementName = "";
        this.combineWithSort = false;
        this.sortedInsert = false;
        
        /** @type {HTMLElement} */
        this.node = null;
        this.onDrop = () => {};
        this.onDragEnter = () => {};
        this.onDragLeave = () => {};
        this.onInsert = () => {};
    }
    
    accept(/** @type {Array<<Struct>>} */ structSet = []) {
        this._accept = structSet;
    }
    
    _onDragEnter() {
        if (View.dragging.value === false) {
            return;
        }
        
        if (this.validDrag() === false) {
            return;
        }
        
        if (this.sortedInsert) {
            // Sorting gets started here
        }
        
        this.onDragEnter(View.dragElement.value.options.data);
    }
    
    _onDragLeave() {
        if (View.dragging.value === false) {
            return;
        }
        
        if (this.validDrag() === false) {
            return;
        }
        
        if (this.sortedInsert) {
            // Sorting gets ended without insert here
        }
        
        this.onDragLeave(View.dragElement.value.options.data);
    }
    
    _onDrop() {
        if (View.dragging.value === false) {
            return;
        }
        
        if (this.validDrag() === false) {
            return;
        }
        
        if (this.sortedInsert) {
            // Sorting gets ended with insert here
            const newItem = this.onInsert(View.dragElement.value.options.data);
            
            /** @type {ListPointer} */
            const pointer = this.interactive.ui.elements.get(this.sortElementName).listPointer;
            
            if (newItem !== false) {
                if (newItem.length === 1) {
                    newItem[1] = performance.now();
                }
                
                pointer.add(newItem[0], newItem[1]);
            }
        }
        
        this.onDrop(View.dragElement.value.options.data);
    }
    
    validDrag() {
        let found = false;
        const className = View.dragElement.value.options.data.constructor.name;
        
        for (let i = 0; i < this._accept.length; i++) {
            if (this._accept[i].name === className) {
                found = true;
                
                break;
            }
        }
        
        if (found === false) {
            return false;
        }
        
        return true;
    }
    
    enable(nodeName = "", /** @type {Array<<Struct>>} */ structSet = [], onDrop = () => {}, sortElementName = "", sortedInsert = false) {
        this.node = this.interactive.ui.nodes.get(nodeName);
        this.onDrop = onDrop;
        this.sortElementName = sortElementName;
        this.combineWithSort = this.sortElementName.length === 0 ? false : true;
        this.sortedInsert = sortedInsert;
        
        this.accept(structSet);
        
        this._onDropBinded = this._onDrop.bind(this);
        this._onDragEnterBinded = this._onDragEnter.bind(this);
        this._onDragLeaveBinded = this._onDragLeave.bind(this);
        
        this.node.node.addEventListener("mouseup", this._onDropBinded, false);
        this.node.node.addEventListener("mouseenter", this._onDragEnterBinded, false);
        this.node.node.addEventListener("mouseleave", this._onDragLeaveBinded, false);
    }
    
    disable() {
        if (this.enabled === false) {
            return;
        }
        
        this.node.node.removeEventListener("mouseenter", this._onDragEnterBinded);
        this.node.node.removeEventListener("mouseleave", this._onDragLeaveBinded);
        this.node.node.removeEventListener("mouseup", this._onDropBinded);
        
        this.node = null;
    }
    
    unmount() {
        this.disable();
    }
}
