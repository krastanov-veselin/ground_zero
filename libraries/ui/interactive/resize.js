'use strict';

class Resize extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
        
        this.left = true;
        this.top = true;
        this.right = true;
        this.bottom = true;
        this.topLeft = true;
        this.topRight = true;
        this.bottomLeft = true;
        this.bottomRight = true;
    }
    
    _pointerUpdate(sizePointer = new Pointer(), positionPointer = new Pointer(), node = new NodeUI(), manual = false) {
        if (this.interactive.ui.interactive.move.enabled === false || manual === true) {
            node.transform.translate(positionPointer.value.x, positionPointer.value.y);
        }
        
        node.transform.sizeXY(sizePointer.value.x, sizePointer.value.y);
    }
    
    enable(sizePointer = new Pointer(), posPointer = new Pointer(), nodeName = "") {
        const sizeFunc = this._pointerUpdate.bind(
            this, 
            sizePointer, 
            posPointer, 
            this.interactive.ui.node
        )
        
        const posFunc = this._pointerUpdate.bind(
            this, 
            sizePointer, 
            posPointer, 
            this.interactive.ui.node
        )
        
        this.interactive.ui.propPointers.set(
            nodeName + "_resize_size", 
            new Pointer(
                sizePointer.listID, 
                sizePointer.itemID, 
                sizePointer.prop, 
                sizeFunc
            )
        );
        
        this.interactive.ui.propPointers.set(
            nodeName + "_resize_pos", 
            new Pointer(
                posPointer.listID, 
                posPointer.itemID, 
                posPointer.prop, 
                posFunc
            )
        );
        
        this.interactive.ui.addElement("main", ResizerLeft, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.left
        });
        this.interactive.ui.addElement("main", ResizerTop, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.top
        });
        this.interactive.ui.addElement("main", ResizerRight, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.right
        });
        this.interactive.ui.addElement("main", ResizerBottom, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.bottom
        });
        this.interactive.ui.addElement("main", ResizerTopLeft, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.topLeft
        });
        this.interactive.ui.addElement("main", ResizerTopRight, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.topRight
        });
        this.interactive.ui.addElement("main", ResizerBottomRight, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.bottomRight
        });
        this.interactive.ui.addElement("main", ResizerBottomLeft, {
            sizePointer: sizePointer,
            posPointer: posPointer,
            active: this.bottomLeft
        });
        
        sizeFunc(true);
        posFunc(true);
        
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
        
        this.interactive.ui.elements.get("ResizerLeft").unmount();
        this.interactive.ui.elements.get("ResizerTop").unmount();
        this.interactive.ui.elements.get("ResizerRight").unmount();
        this.interactive.ui.elements.get("ResizerBottom").unmount();
        this.interactive.ui.elements.get("ResizerTopLeft").unmount();
        this.interactive.ui.elements.get("ResizerTopRight").unmount();
        this.interactive.ui.elements.get("ResizerBottomRight").unmount();
        this.interactive.ui.elements.get("ResizerBottomLeft").unmount();
    }
    
    unmount() {
        if (this.enabled === false) {
            return;
        }
        
        this.disable();
    }
}

class Resizer extends UI {
    constructor(...p) {
        super(...p);
        
        /** @type {Pointer} */
        this.sizePointer = this.options.sizePointer;
        /** @type {Pointer} */
        this.posPointer = this.options.posPointer;
        
        this.startPos = new Pos();
        this.startStatePos = new Pos();
        this.startSize = new Size();
        this.startStateSize = new Size();
    }
    
    mounted() {
        this.interactive.move.muted = true;
    }
    
    display() {
        if (this.options.active === false) {
            return this.div({
                style: "display: none;"
            });
        }
        
        return this.div();
    }
}

class ResizerLeft extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev, applyResizer = true) {
        if (applyResizer) {
            document.body.style.cursor = "ew-resize !important";
        }
        
        this.startPos.x = ev.pageX;
        this.startPos.y = ev.pageY;
        
        this.startStatePos.x = this.posPointer.value.x;
        
        this.startStateSize.x = this.sizePointer.value.x;
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.posPointer.value.x = this.startStatePos.x + (ev.pageX - this.startPos.x);
        this.sizePointer.value.x = this.startStateSize.x - (ev.pageX - this.startPos.x);
        
        this.sizePointer.update();
        this.posPointer.update();
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerTop extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev, applyResizer = true) {
        if (applyResizer) {
            document.body.style.cursor = "ns-resize !important";
        }
        
        this.startPos.x = ev.pageX;
        this.startPos.y = ev.pageY;
        
        this.startStatePos.y = this.posPointer.value.y;
        
        this.startStateSize.y = this.sizePointer.value.y;
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.posPointer.value.y = this.startStatePos.y + (ev.pageY - this.startPos.y);
        this.sizePointer.value.y = this.startStateSize.y - (ev.pageY - this.startPos.y);
        
        this.sizePointer.update();
        this.posPointer.update();
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerRight extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev, applyResizer = true) {
        if (applyResizer) {
            document.body.style.cursor = "ew-resize !important";
        }
        
        this.startPos.x = ev.pageX;
        this.startPos.y = ev.pageY;
        
        this.startStateSize.x = this.sizePointer.value.x;
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.sizePointer.value.x = this.startStateSize.x + (ev.pageX - this.startPos.x);
        
        this.sizePointer.update();
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerBottom extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev, applyResizer = true) {
        if (applyResizer) {
            document.body.style.cursor = "ns-resize !important";
        }
        
        this.startPos.x = ev.pageX;
        this.startPos.y = ev.pageY;
        
        this.startStateSize.y = this.sizePointer.value.y;
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.sizePointer.value.y = this.startStateSize.y + (ev.pageY - this.startPos.y);
        
        this.sizePointer.update();
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerTopLeft extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = "nwse-resize !important";
        
        this.parent.elements.get("ResizerLeft").onStart(node, pointer, id, ev, false);
        this.parent.elements.get("ResizerTop").onStart(node, pointer, id, ev, false);
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.parent.elements.get("ResizerLeft").onResize(node, pointer, id, ev);
        this.parent.elements.get("ResizerTop").onResize(node, pointer, id, ev);
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerTopRight extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = "nesw-resize !important";
        
        this.parent.elements.get("ResizerRight").onStart(node, pointer, id, ev, false);
        this.parent.elements.get("ResizerTop").onStart(node, pointer, id, ev, false);
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.parent.elements.get("ResizerRight").onResize(node, pointer, id, ev);
        this.parent.elements.get("ResizerTop").onResize(node, pointer, id, ev);
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerBottomRight extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = "nesw-resize !important";
        
        this.parent.elements.get("ResizerRight").onStart(node, pointer, id, ev, false);
        this.parent.elements.get("ResizerBottom").onStart(node, pointer, id, ev, false);
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.parent.elements.get("ResizerRight").onResize(node, pointer, id, ev);
        this.parent.elements.get("ResizerBottom").onResize(node, pointer, id, ev);
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}

class ResizerBottomLeft extends Resizer {
    mounted() {
        super.mounted();
        
        this.interactive.move.enable(new Pointer(), "main");
        
        this.interactive.move.onStart = this.onStart.bind(this);
        this.interactive.move.onMove = this.onResize.bind(this);
        this.interactive.move.onEnd = this.onEnd.bind(this);
    }
    
    onStart(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = "nwse-resize !important";
        
        this.parent.elements.get("ResizerLeft").onStart(node, pointer, id, ev, false);
        this.parent.elements.get("ResizerBottom").onStart(node, pointer, id, ev, false);
    }
    
    onResize(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        this.parent.elements.get("ResizerLeft").onResize(node, pointer, id, ev);
        this.parent.elements.get("ResizerBottom").onResize(node, pointer, id, ev);
    }
    
    onEnd(node = new NodeUI(), pointer = new Pointer(), id = "", /** @type {MouseEvent} */ ev) {
        document.body.style.cursor = null;
    }
}
