'use strict';

class MoveMount {
    constructor(
        id = "", 
        node = new NodeUI(), 
        pointer = new Pointer(), 
        down = () => {}, 
        move = () => {}, 
        up = () => {}
    ) {
        this.id = id;
        this.node = node;
        this.pointer = pointer;
        this.down = down;
        this.move = move;
        this.up = up;
        
        this.mount();
    }
    
    mount() {
        this.node.node.addEventListener("mousedown", this.down, false);
    }
    
    unmount() {
        this.node.node.removeEventListener("mousedown", this.down);
    }
}

class Move extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
        
        this.nodeName = "";
        /** @type {MoveMount} */
        this.mount = null;
        this.startPos = new Pos();
        this.startTransform = new Pos();
        this.muted = false;
        this.paused = false;
        
        this.onStart = (node, pointer, id, ev) => {};
        this.onMove = (node, pointer, id, ev) => {};
        this.onEnd = (node, pointer, id, ev) => {};
    }
    
    _down(node = new NodeUI(), pointer = new Pointer(), id = "", ev) {
        if (this.paused === true) {
            return;
        }
        
        document.body.style.userSelect = "none";
        
        this.startPos.x = ev.pageX;
        this.startPos.y = ev.pageY;
        this.startTransform.x = node.transform.matrix[0][0];
        this.startTransform.y = node.transform.matrix[0][1];
        
        window.addEventListener("mousemove", this.mount.move, false);
        window.addEventListener("mouseup", this.mount.up, false);
        
        this.onStart(node, pointer, id, ev);
    }
    
    _move(node = new NodeUI(), pointer = new Pointer(), id = "", ev) {
        if (this.muted === false) {
            pointer.value.x = Math.round(ev.pageX - (this.startPos.x - this.startTransform.x));
            pointer.value.y = Math.round(ev.pageY - (this.startPos.y - this.startTransform.y));
            
            pointer.value = pointer.value;
        }
        
        this.onMove(node, pointer, id, ev);
    }
    
    _up(node = new NodeUI(), pointer = new Pointer(), id = "", ev) {
        window.removeEventListener("mousemove", this.mount.move);
        window.removeEventListener("mouseup", this.mount.up);
        
        document.body.style.userSelect = null;
        
        this.onEnd(node, pointer, id, ev);
    }
    
    _pointerUpdate(pointer = new Pointer(), node = new NodeUI()) {
        node.transform.translate(pointer.value.x, pointer.value.y);
    }
    
    enable(pointer = new Pointer(), nodeName = "") {
        this.nodeName = nodeName;
        
        const node = this.interactive.ui.nodes.get(nodeName);
        
        this.mount = new MoveMount(
            nodeName, 
            node,
            pointer, 
            this._down.bind(this, this.interactive.ui.node, pointer, nodeName),
            this._move.bind(this, this.interactive.ui.node, pointer, nodeName),
            this._up.bind(this, this.interactive.ui.node, pointer, nodeName)
        );
        
        this.interactive.ui.propPointers.set(
            nodeName + "_move", 
            new Pointer(
                pointer.listID, 
                pointer.itemID, 
                pointer.prop, 
                this._pointerUpdate.bind(
                    this, 
                    pointer, 
                    this.interactive.ui.node
                )
            )
        );
        
        this.enabled = true;
    }
    
    disable() {
        this.interactive.ui.propPointers.get(this.nodeName + "_move").unmount();
        this.interactive.ui.propPointers.delete(this.nodeName + "_move");
        
        this.enabled = false;
        
        this.mount.unmount();
        this.mount = null;
    }
    
    unmount() {
        if (this.enabled === false) {
            return;
        }
        
        this.disable();
    }
}
