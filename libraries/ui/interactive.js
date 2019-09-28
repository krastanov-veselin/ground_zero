'use strict';

class InteractiveLibrary extends Ground {
    constructor(interactive = new InteractiveUI()) {
        super();
        
        this.interactive = interactive;
        this.enabled = false;
    }
    
    /** @abstract Abstracted in direct inheritance */
    enable() {}
    /** @abstract Abstracted in direct inheritance */
    disable() {}
    /** @abstract Abstracted in direct inheritance */
    unmount() {}
}

class InteractiveUI extends Ground {
    constructor(ui = new UI()) {
        super();
        
        this.ui = ui;
        this.move = new Move(this);
        this.drag = new Drag(this);
        this.drop = new Drop(this);
        this.resize = new Resize(this);
        this.rotate = new Rotate(this);
        this.skew = new Skew(this);
        this.sort = new Sort(this);
        this.padding = new Padding(this);
    }
}
