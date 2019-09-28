'use strict';

class NodeUI extends Ground {
    constructor(node = new HTMLElement(), options = new OptionsUI()) {
        super();
        
        this.node = node;
        this.options = options;
        this.transform = new Transform(this);
    }
}

class NodeState extends Ground {
    constructor(/** @type {Pointer[]} */ pointers = [], onUpdate = () => {}, rewritable = false) {
        super();
        
        this.pointers = pointers;
        this.onUpdate = onUpdate;
        this.rewritable = rewritable;
    }
}

class NodeValue extends Ground {
    constructor(key = "", value = "") {
        super();
        
        this.key = key;
        this.value = value;
    }
}

class NodeComment extends Ground {
    constructor(
        /** @type {Comment} */ comment,
        /** @type {Pointer[]} */ pointers = [],
        onUpdate = () => true,
        elementReference = UI,
        data = () => ({}),
        name = ""
    ) {
        super();
        
        this.comment = comment;
        this.pointers = pointers;
        this.onUpdate = onUpdate;
        this.elementReference = elementReference;
        this.data = data;
        this.name = name;
    }
}

class NodePosition extends Ground {
    constructor(
        /** @type {Comment} */ comment,
        /** @type {Pointer[]} */ pointers = [],
        elementName = "",
        condition = () => true,
        name = ""
    ) {
        super();
        
        this.comment = comment;
        this.pointers = pointers;
        this.elementName = elementName;
        this.condition = condition;
        this.name = name.length === "" ? "position_" + performance.now() + "_" + this.random(1, 99999) : name;
    }
}

class NodeElement extends Ground {
    constructor(
        ref = UI,
        data = {},
        name = "",
    ) {
        super();
        
        this.ref = ref;
        this.data = data;
        this.name = name;
    }
}
