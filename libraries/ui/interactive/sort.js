'use strict';

class Sort extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
        
        this.onStart = () => {};
        this.onEnd = () => {};
        this.onSort = () => {};
    }
    
    _onStart() {
        this.interactive.ui.parent.sorting = true;
        
        this.onStart();
    }
    
    _onEnd() {
        this.interactive.ui.parent.sorting = false;
        
        this.onEnd();
    }
    
    onEnter() {
        if (View.dragging.value === false) {
            return;
        }
        
        if (this.interactive.ui.parent.sorting === false) {
            return;
        }
        
        const placeholderNode = View.dragPlaceholder.value;
        const targetNode = this.interactive.ui.node.node;
        
        if (targetNode.compareDocumentPosition(placeholderNode) & 0x04) { // Target is after hovered
            targetNode.before(placeholderNode);
            
            this.listPointer.sort(this.interactive.ui.name, View.dragElement.value.name, 0);
        } else {
            targetNode.after(placeholderNode);
            
            this.listPointer.sort(this.interactive.ui.name, View.dragElement.value.name, 1);
        }
        
        this.onSort();
    }
    
    enable(listPointer = new ListPointer(), nodeName = "") {
        this.interactive.drag.enable(nodeName, "#0001", "left");
        this.interactive.drag.onStart = this._onStart.bind(this);
        this.interactive.drag.onEnd = this._onEnd.bind(this);
        
        this.interactive.ui.node.node.addEventListener("mouseenter", this.onEnter.bind(this), false);
        
        this.listPointer = listPointer;
    }
    
    disable() {
        if (this.enabled === false) {
            return;
        }
        
        this.listPointer.unmount();
        this.listPointer = null;
        
        this.interactive.ui.node.node.removeEventListener("mouseenter", this.onEnter.bind(this));
        
        this.interactive.drag.unmount();
    }
    
    unmount() {
        this.disable();
    }
}
