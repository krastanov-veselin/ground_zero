class Drag extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
        
        this.placeholder = null;
        this.placeholderColor = "transparent";
        this.floating = "none";
        
        this.onStart = () => {};
        this.onEnd = () => {};
        
        this._onDragStartBinded = null;
    }
    
    _onDragStart(nodeName = "", ev) {
        this.interactive.move.paused = false;
        
        this.interactive.move.onStart = this._onStart.bind(this);
        this.interactive.move.onEnd = this._onEnd.bind(this);
        this.interactive.move.enable(View.dragPos, nodeName);
        
        this.interactive.move._down(this.interactive.ui.node, View.dragPos, nodeName, ev);
    }
    
    _onStart() {
        this.interactive.ui.node.node.style.pointerEvents = "none";
        
        const rect = this.interactive.ui.node.node.getBoundingClientRect();
        
        this.placeholder = document.createElement("div");
        
        let margin = this.interactive.ui.node.node.style.margin;
        
        if (margin === "") {
            margin = window.getComputedStyle(this.interactive.ui.node.node).margin;
        }
        
        if (margin === "") {
            margin = "0px";
        }
        
        const marginInt = margin === "" ? 0 : parseInt(margin.replace("px", "").replace("%", ""));
        
        if (this.floating === "left") {
            this.placeholder.style.float = "left";
        }
        
        if (this.floating === "right") {
            this.placeholder.style.float = "right";
        }
        
        this.placeholder.style.margin = margin;
        this.placeholder.style.backgroundColor = this.placeholderColor;
        this.placeholder.style.borderRadius = this.interactive.ui.node.node.style.borderRadius;
        this.placeholder.style.width = rect.width + "px";
        this.placeholder.style.height = rect.height + "px";
        
        if (this.placeholder.style.borderRadius === null || this.placeholder.style.borderRadius === "") {
            this.placeholder.style.borderRadius = window.getComputedStyle(this.interactive.ui.node.node).borderRadius;
        }
        
        this.interactive.ui.node.node.style.position = "absolute";
        this.interactive.ui.node.node.style.left = (rect.left - marginInt) + "px";
        this.interactive.ui.node.node.style.top = (rect.top - marginInt) + "px";
        
        this.interactive.ui.node.node.after(this.placeholder);
        document.body.appendChild(this.interactive.ui.node.node);
        
        View.dragging.value = true;
        View.dragElement.value = this.interactive.ui;
        View.dragPlaceholder.value = this.placeholder;
        
        this.onStart();
    }
    
    _onEnd() {
        this.interactive.move.paused = true;
        
        View.dragging.value = false;
        View.dragElement.value = null;
        View.dragPlaceholder.value = null;
        
        this.interactive.ui.node.node.style.position = null;
        this.interactive.ui.node.node.style.left = null;
        this.interactive.ui.node.node.style.top = null;
        
        this.placeholder.after(this.interactive.ui.node.node);
        this.placeholder.parentNode.removeChild(this.placeholder);
        this.placeholder = null;
        
        this.interactive.move.mount.pointer.value.x = 0;
        this.interactive.move.mount.pointer.value.y = 0;
        this.interactive.move.mount.pointer.update();
        
        this.interactive.move.unmount();
        
        this.onEnd();
        
        this.interactive.ui.node.node.style.pointerEvents = null;
    }
    
    enable(nodeName = "main", placeholderColor = "transparent", floating = "none") {
        this.placeholderColor = placeholderColor;
        this.floating = floating;
        
        this._onDragStartBinded = this._onDragStart.bind(this, nodeName);
        
        this.interactive.ui.node.node.addEventListener("mousedown", this._onDragStartBinded, false);
    }
    
    disable() {
        this.interactive.ui.node.node.removeEventListener("mousedown", this._onDragStartBinded);
        
        this.interactive.move.unmount();
    }
    
    unmount() {
        if (this.enabled === false) {
            return;
        }
        
        this.disable();
    }
}
