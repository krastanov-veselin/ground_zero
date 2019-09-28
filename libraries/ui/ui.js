'use strict';

Data.create("ui");
Data.lists.get("ui").add({
    cursor: new Pos(),
    windowResponderActive: false,
    windowKeyDownEvents: [],
    windowKeyUpEvents: [],
    dragging: false,
    /** @type {UI} */
    dragElement: null,
    /** @type {HTMLDivElement} */
    dragPlaceholder: null,
    dragPos: new Pos(),
    dragLock: false,
}, "main");

const View = {
    cursor: new Pointer("ui", "main", "cursor"),
    windowResponderActive: new Pointer("ui", "main", "windowResponderActive"),
    windowKeyDownEvents: new Pointer("ui", "main", "windowKeyDownEvents"),
    windowKeyUpEvents: new Pointer("ui", "main", "windowKeyUpEvents"),
    dragging: new Pointer("ui", "main", "dragging"),
    dragElement: new Pointer("ui", "main", "dragElement"),
    dragPlaceholder: new Pointer("ui", "main", "dragPlaceholder"),
    dragPos: new Pointer("ui", "main", "dragPos"),
    dragLock: new Pointer("ui", "main", "dragLock"),
};

class UI extends ShortcutsUI {
    constructor(/** @type {UI} */ parent = null, options = new OptionsUI()) {
        super();
        
        this.parent = parent;
        /** @type {Map<string, UI>} */
        this.elements = new Map();
        /** @type {Map<string, NodeUI>} */
        this.nodes = new Map();
        /** @type {NodeUI} */
        this.node = null;
        this.name = "";
        this.options = options;
        /** @type {Map<string, Pointer>} */
        this.propPointers = new Map();
        this.timeouts = new Map();
        this.intervals = new Map();
        this.interactive = new InteractiveUI(this);
        
        this._windowMouseUp = null;
        this._windowMouseDown = null;
        this._windowMouseMove = null;
    }
    
    setTimeout(func = () => {}, delay = 0, name = "") {
        if (name.length === 0) {
            name = "timeout_" + performance.now() + "_" + this.random(1, 99999);
        }
        
        if (this.timeouts.has(name)) {
            this.clearTimeout(name);
        }
        
        this.timeouts.set(name, setTimeout(func, delay));
    }
    
    clearTimeout(name = "") {
        if (this.timeouts.has(name) === false) {
            return;
        }
        
        clearTimeout(this.timeouts.get(name));
        
        this.timeouts.delete(name);
    }
    
    setInterval(func = () => {}, delay = 0, name = "") {
        if (name.length === "") {
            name = "interval_" + performance.now() + "_" + this.random(1, 99999);
        }
        
        if (this.intervals.has(name)) {
            this.clearInterval(name);
        }
        
        this.intervals.set(name, this.setInterval(func, delay));
    }
    
    clearInterval(name = "") {
        if (this.intervals.has(name) === false) {
            return;
        }
        
        this.clearInterval(this.intervals.get(name));
        
        this.intervals.delete(name);
    }
    
    initialise(query = "") {
        const domNode = document.querySelector(query);
        
        if (domNode === null) {
            throw "UI Initialization failed, query[\"" + query + "\"] cannot find node.";
        }
        
        this.mount();
        
        domNode.appendChild(this.node.node);
        
        this.prepareWindow();
    }
    
    _windowMouseUpEvent(ev) {
        window.removeEventListener("mousemove", this._windowMouseMove);
        
        View.windowResponderActive.value = false;
    }
    
    _windowMouseMoveEvent(ev) {
        View.cursor.value.x = ev.pageX;
        View.cursor.value.y = ev.pageY;
    }
    
    _windowMouseDownEvent(ev) {
        View.cursor.value.x = ev.pageX;
        View.cursor.value.y = ev.pageY;
        View.windowResponderActive.value = true;
        
        window.addEventListener("mousemove", this._windowMouseMove, false);
    }
    
    prepareWindow() {
        this._windowMouseUp = this._windowMouseUpEvent.bind(this);
        this._windowMouseMove = this._windowMouseMoveEvent.bind(this);
        this._windowMouseDown = this._windowMouseDownEvent.bind(this);
        
        window.addEventListener("mouseup", this._windowMouseUp, false);
        window.addEventListener("mousedown", this._windowMouseDown, false);
    }
    
    releaseWindow() {
        window.removeEventListener("mouseup", this._windowMouseUp);
        window.removeEventListener("mousedown", this._windowMouseDown);
    }
    
    mount() {
        this.beforeMount();
        
        const node = this.display();
        
        this.nodes.delete(node.options.name);
        
        let baseObj = this.__proto__;
        let searchingForParents = true;
        
        while (searchingForParents) {
            if (baseObj.__proto__ === null) {
                searchingForParents = false;
                
                break;
            }
            
            node.node.classList.add(baseObj.__proto__.constructor.name);
            
            baseObj = baseObj.__proto__;
        }
        
        baseObj = null;
        
        node.options.name = "main";
        
        node.node.classList.add(this.constructor.name);
        node.node.classList.add("main");
        
        if (this.name.length !== 0) {
            node.node.classList.add(this.name);
        }
        
        this.nodes.set(node.options.name, node);
        this.node = node;
        
        this.mounted();
    }
    
    unmount() {
        this.onUnmount(() => {
            this.doUnmount();
        });
    }
    
    doUnmount() {
        this.interactive.move.unmount();
        this.interactive.resize.unmount();
        this.interactive.drag.unmount();
        this.interactive.drop.unmount();
        this.interactive.sort.unmount();
        this.interactive.padding.unmount();
        
        this.nodes.forEach(node => {
            // Problem ID[1]: this can cause sub element async unmount to lose the parent node of it's main node
            // Solution?
            this.cleanNodeEvents(node);
        });
        
        // Problem ID[1]
        if (this.node.node.parentNode !== null) {
            this.node.node.parentNode.removeChild(this.node.node);
        }
        
        if (this.parent !== null) {
            this.parent.elements.delete(this.name);
        }
        
        this.propPointers.forEach(pointers => {
            for (let i = 0; i < pointers.length; i++) {
                pointers[i].unmount();
            }
        });
        
        this.propPointers.clear();
        
        this.node = null;
        
        this.nodes.clear();
        
        this.elements.forEach(element => {
            element.unmount();
        });
    }
    
    element(classReference = UI, options = new OptionsUI(), name = "") {
        if (name.length === 0) {
            name = classReference.name;
        }
        
        const element = new classReference(this, options);
        
        element.name = name;
        
        this.elements.set(name, element);
        
        return element;
    }
    
    addElement(nodeName = "", classReference = UI, options = new OptionsUI(), name = "") {
        const element = this.element(classReference, options, name);
        const node = this.nodes.get(nodeName);
        
        this.applyElement(node, element);
    }
    
    create(type = "", options = new OptionsUI(), /** @type {Array<NodeUI|null>} */ children = []) {
        const node = new NodeUI(document.createElement(type), options);
        
        this.mountNode(node);
        this.setupFormProbability(type, node, children);
        this.setupNodeType(node);
        this.setupNodeText(node);
        this.setupNodeValue(node);
        this.setupNodeStyle(node);
        this.setupNodeClass(node);
        this.setupNodeEvents(node);
        this.applyChildren(node, children);
        
        return node;
    }
    
    mountNode(node = new NodeUI()) {
        if (node.options.name.length === 0) {
            node.options.name = performance.now() + "_" + this.random(1, 99999);
        } else {
            node.node.classList.add(node.options.name);
        }
        
        this.nodes.set(node.options.name, node);
    }
    
    applyChildren(node = new NodeUI(), /** @type {Array<NodeUI|null>} */ children = []) {
        if (children.length !== 0) {
            for (let i = 0; i < children.length; i++) {
                if (children[i] !== null) {
                    if (children[i].constructor.name === "NodeUI") {
                        this.applyNode(node, children[i]);
                    } else if (children[i].constructor.name === "NodeComment") {
                        this.applyStateMount(node, children[i]);
                    } else if (children[i].constructor.name === "NodePosition") {
                        this.applyStatePosition(node, children[i]);
                    } else {
                        this.applyElement(node, children[i]);
                    }
                }
            }
        }
    }
    
    applyNode(node = new NodeUI(), child = new NodeUI()) {
        node.node.appendChild(child.node);
    }
    
    applyStateMount(node = new NodeUI(), child = new NodeComment()) {
        if (child.name.length === 0) {
            child.name = child.elementReference.name;
        }
        
        node.node.appendChild(child.comment);
        
        // Memory leak?
        const pointers = [];
        
        for (let i = 0; i < child.pointers.length; i++) {
            pointers.push(new Pointer(
                child.pointers[i].listID,
                child.pointers[i].itemID,
                child.pointers[i].prop,
                () => {
                    const result = child.onUpdate();
                    
                    if (result) {
                        if (this.elements.has(child.name) === false) {
                            const element = this.element(child.elementReference, child.data(), child.name);
                            
                            element.mount();
                            
                            child.comment.after(element.node.node);
                        }
                    } else {
                        if (this.elements.has(child.name)) {
                            this.elements.get(child.name).unmount();
                            this.elements.delete(child.name);
                        }
                    }
                }
            ));
            
            this.propPointers.set(child.name + "_mounts", pointers);
            
            pointers[pointers.length - 1].onUpdate();
        }
    }
    
    applyStatePosition(node = new NodeUI(), child = new NodePosition()) {
        node.node.appendChild(child.comment);
        
        const pointers = [];
        
        for (let i = 0; i < child.pointers.length; i++) {
            pointers.push(new Pointer(
                child.pointers[i].listID,
                child.pointers[i].itemID,
                child.pointers[i].prop,
                () => {
                    const result = child.condition();
                    
                    if (result) {
                        if (this.elements.has(child.elementName)) {
                            child.comment.after(this.elements.get(child.elementName).node.node);
                        }
                    } else {
                        
                    }
                }
            ));
            
            this.propPointers.set(child.name + "_positions", pointers);
            
            setTimeout(() => {
                pointers[pointers.length - 1].onUpdate();
            }, 0);
        }
    }
    
    applyElement(node = new NodeUI(), child = new UI()) {
        child.mount();
        node.node.appendChild(child.node.node);
    }
    
    setupFormProbability(node = new NodeUI(), type = "", /** @type {Array<NodeUI|null>} */ children = []) {
        if (type === "form") {
            children.push(this.input({
                type: "submit",
                style: "display: none;"
            }));
            
            if (node.options.onSubmit === null) {
                node.options.onSubmit = () => {};
            }
        }
    }
    
    setupNodeType(node = new NodeUI()) {
        if (node.options.type.length !== 0) {
            node.node.setAttribute("type", node.options.type);
        }
    }
    
    setupNodeText(node = new NodeUI()) {
        if (node.options.text.length !== 0) {
            node.node.innerText = node.options.text;
        }
        
        if (node.options.stateText !== null) {
            const pointers = [];
            const func = (newVal, oldVal) => {
                if (
                    node.options.stateText.rewritable === false && 
                    newVal === oldVal && 
                    typeof newVal !== "undefined" && 
                    typeof oldVal !== "undefined"
                ) {
                    return;
                }
                
                node.options.stateText.onUpdate(updateFunc, newVal, oldVal);
            };
            const updateFunc = (/** @type {NodeValue[]} */ value) => {
                node.node.innerText = value;
            }
            
            for (let i = 0; i < node.options.stateText.pointers.length; i++) {
                pointers.push(new Pointer(
                    node.options.stateText.pointers[i].listID,
                    node.options.stateText.pointers[i].itemID,
                    node.options.stateText.pointers[i].prop,
                    func
                ));
            }
            
            this.propPointers.set(node.options.name + "_text", pointers);
            
            func();
        }
    }
    
    setupNodeValue(node = new NodeUI()) {
        if (node.options.value.length !== 0) {
            node.node.value = node.options.value;
        }
        
        if (node.options.stateValue !== null) {
            const pointers = [];
            const func = (newVal, oldVal) => {
                if (
                    node.options.stateValue.rewritable === false && 
                    newVal === oldVal && 
                    typeof newVal !== "undefined" && 
                    typeof oldVal !== "undefined"
                ) {
                    return;
                }
                
                node.options.stateValue.onUpdate(updateFunc, newVal, oldVal);
            };
            const updateFunc = (/** @type {NodeValue[]} */ value) => {
                node.node.value = value;
            }
            
            for (let i = 0; i < node.options.stateValue.pointers.length; i++) {
                pointers.push(new Pointer(
                    node.options.stateValue.pointers[i].listID,
                    node.options.stateValue.pointers[i].itemID,
                    node.options.stateValue.pointers[i].prop,
                    func
                ));
            }
            
            this.propPointers.set(node.options.name + "_value", pointers);
            
            func();
        }
    }
    
    setupNodeStyle(node = new NodeUI()) {
        if (node.options.style.length !== 0) {
            node.node.style = node.options.style;
        }
        
        if (node.options.stateStyle !== null) {
            const pointers = [];
            const func = (newVal, oldVal) => {
                if (
                    node.options.stateStyle.rewritable === false && 
                    newVal === oldVal && 
                    typeof newVal !== "undefined" && 
                    typeof oldVal !== "undefined"
                ) {
                    return;
                }
                
                node.options.stateStyle.onUpdate(updateFunc, newVal, oldVal);
            };
            const updateFunc = (/** @type {NodeValue[]} */ styles) => {
                for (let i = 0; i < styles.length; i++) {
                    node.node.style[styles[i].key] = styles[i].value;
                }
            }
            
            for (let i = 0; i < node.options.stateStyle.pointers.length; i++) {
                pointers.push(new Pointer(
                    node.options.stateStyle.pointers[i].listID,
                    node.options.stateStyle.pointers[i].itemID,
                    node.options.stateStyle.pointers[i].prop,
                    func
                ));
            }
            
            this.propPointers.set(node.options.name + "_style", pointers);
            
            func();
        }
    }
    
    setupNodeClass(node = new NodeUI()) {
        if (node.options.className.length !== 0) {
            node.node.className = node.options.className;
        }
        
        if (node.options.stateClass !== null) {
            const pointers = [];
            const func = (newVal, oldVal) => {
                if (
                    node.options.stateClass.rewritable === false && 
                    newVal === oldVal && 
                    typeof newVal !== "undefined" && 
                    typeof oldVal !== "undefined"
                ) {
                    return;
                }
                
                node.options.stateClass.onUpdate(updateFunc, newVal, oldVal);
            };
            const updateFunc = (/** @type {NodeValue[]} */ classes) => {
                for (let i = 0; i < classes.length; i++) {
                    if (classes[i].value) {
                        node.node.classList.add(classes[i].key);
                    } else {
                        node.node.classList.remove(classes[i].key);
                    }
                }
            }
            
            for (let i = 0; i < node.options.stateClass.pointers.length; i++) {
                pointers.push(new Pointer(
                    node.options.stateClass.pointers[i].listID,
                    node.options.stateClass.pointers[i].itemID,
                    node.options.stateClass.pointers[i].prop,
                    func
                ));
            }
            
            this.propPointers.set(node.options.name + "_class", pointers);
            
            func();
        }
    }
    
    setupNodeEvents(node = new NodeUI()) {
        if (node.options.onClick !== null) {
            node.node.addEventListener("click", node.options.onClick, false);
        }
        
        if (node.options.onDoubleClick !== null) {
            node.node.addEventListener("dblclick", node.options.onDoubleClick, false);
        }
        
        if (node.options.onMouseDown !== null) {
            node.node.addEventListener("mousedown", node.options.onMouseDown, false);
        }
        
        if (node.options.onMouseUp !== null) {
            node.node.addEventListener("mouseup", node.options.onMouseUp, false);
        }
        
        if (node.options.onMouseOver !== null) {
            node.node.addEventListener("mouseover", node.options.onMouseOver, false);
        }
        
        if (node.options.onMouseOut !== null) {
            node.node.addEventListener("mouseout", node.options.onMouseOut, false);
        }
        
        if (node.options.onMouseEnter !== null) {
            node.node.addEventListener("mouseenter", node.options.onMouseEnter, false);
        }
        
        if (node.options.onMouseLeave !== null) {
            node.node.addEventListener("mouseleave", node.options.onMouseLeave, false);
        }
        
        if (node.options.onMouseMove !== null) {
            node.node.addEventListener("mousemove", node.options.onMouseMove, false);
        }
        
        if (node.options.onRightClick !== null) {
            node.node.addEventListener("contextmenu", node.options.onRightClick, false);
        }
        
        if (node.options.onKeyUp !== null) {
            node.node.addEventListener("keyup", node.options.onKeyUp, false);
        }
        
        if (node.options.onKeyDown !== null) {
            node.node.addEventListener("keydown", node.options.onKeyDown, false);
        }
        
        if (node.options.onScroll !== null) {
            node.node.addEventListener("scroll", node.options.onScroll, false);
        }
        
        if (node.options.onMouseWheel !== null) {
            node.node.addEventListener("mousewheel", node.options.onMouseWheel, false);
        }
        
        if (node.options.onResize !== null) {
            node.node.addEventListener("resize", node.options.onResize, false);
        }
        
        if (node.options.onSubmit !== null) {
            node.options._onSubmit = node.options.onSubmit;
            node.options.onSubmit = ev => {
                ev.preventDefault();
                
                node.options._onSubmit(ev)
            };
            
            node.node.addEventListener("submit", node.options.onSubmit, false);
        }
    }
    
    cleanNodeEvents(node = new NodeUI()) {
        if (node.options.onClick !== null) {
            node.node.removeEventListener("click", node.options.onClick);
            
            node.options.onClick = null;
        }
        
        if (node.options.onDoubleClick !== null) {
            node.node.removeEventListener("dblclick", node.options.onDoubleClick);
            
            node.options.onDoubleClick = null;
        }
        
        if (node.options.onMouseDown !== null) {
            node.node.removeEventListener("mousedown", node.options.onMouseDown);
            
            node.options.onMouseDown = null;
        }
        
        if (node.options.onMouseUp !== null) {
            node.node.removeEventListener("mouseup", node.options.onMouseUp);
            
            node.options.onMouseUp = null;
        }
        
        if (node.options.onMouseOver !== null) {
            node.node.removeEventListener("mouseover", node.options.onMouseOver);
            
            node.options.onMouseOver = null;
        }
        
        if (node.options.onMouseOut !== null) {
            node.node.removeEventListener("mouseout", node.options.onMouseOut);
            
            node.options.onMouseOut = null;
        }
        
        if (node.options.onMouseEnter !== null) {
            node.node.removeEventListener("mouseenter", node.options.onMouseEnter);
            
            node.options.onMouseEnter = null;
        }
        
        if (node.options.onMouseLeave !== null) {
            node.node.removeEventListener("mouseleave", node.options.onMouseLeave);
            
            node.options.onMouseLeave = null;
        }
        
        if (node.options.onMouseMove !== null) {
            node.node.removeEventListener("mousemove", node.options.onMouseMove);
            
            node.options.onMouseMove = null;
        }
        
        if (node.options.onRightClick !== null) {
            node.node.removeEventListener("contextmenu", node.options.onRightClick);
            
            node.options.onRightClick = null;
        }
        
        if (node.options.onKeyUp !== null) {
            node.node.removeEventListener("keyup", node.options.onKeyUp);
            
            node.options.onKeyUp = null;
        }
        
        if (node.options.onKeyDown !== null) {
            node.node.removeEventListener("keydown", node.options.onKeyDown);
            
            node.options.onKeyDown = null;
        }
        
        if (node.options.onScroll !== null) {
            node.node.removeEventListener("scroll", node.options.onScroll);
            
            node.options.onScroll = null;
        }
        
        if (node.options.onMouseWheel !== null) {
            node.node.removeEventListener("mousewheel", node.options.onMouseWheel);
            
            node.options.onMouseWheel = null;
        }
        
        if (node.options.onResize !== null) {
            node.node.removeEventListener("resize", node.options.onResize);
            
            node.options.onResize = null;
        }
        
        if (node.options.onSubmit !== null) {
            node.node.removeEventListener("submit", node.options.onSubmit);
            
            node.options.onSubmit = null;
            node.options._onSubmit = null;
        }
    }
    
    // Batching of updates?
    state(/** @type {Pointer[]} */ pointers = [], onUpdate = (update = () => [this.value("", "")]) => update(), rewritable = false) {
        if (pointers.constructor.name === "Pointer") {
            return new NodeState([pointers], onUpdate, rewritable);
        }
        
        return new NodeState(pointers, onUpdate, rewritable);
    }
    
    value(key = "", value = null) {
        return new NodeValue(key, value);
    }
    
    stateMount(
        /** @type {Pointer[]} */ pointers = [], 
        onUpdate = () => {}, 
        elementReference = UI, 
        data = {}, 
        name = ""
    ) {
        return new NodeComment(
            document.createComment(""),
            pointers,
            onUpdate,
            elementReference,
            data,
            name
        );
    }
    
    statePosition(/** @type {Pointer[]} */ pointers = [], elementName = "", condition = () => false, name = "") {
        return new NodePosition(
            document.createComment(""),
            pointers,
            elementName,
            condition,
            name
        );
    }
    
    list(name = "", listNode = new NodeUI(), listID = "", itemClassReference = UI) {
        return this.element(ListUI, {
            listNode: listNode,
            listID: listID,
            itemClassReference: itemClassReference
        }, name);
    }
    
    keyDownUpdate(update = () => {}) {
        setTimeout(update, 0);
    }
    
    /**
     * @abstract Method is abstract, implemented in extensions of UI class
     * @returns {NodeUI}
     * */
    display() {}
    
    /**
     * @abstract Method is abstract, implemented in extensions of UI class
     * */
    mounted() {}
    
    /**
     * @abstract Method is abstract, implemented in extensions of UI class
     * */
    beforeMount() {}
    
    /**
     * @abstract Method is abstract, implemented in extensions of UI class
     * */
    onUnmount(unmount = () => {}) {
        unmount();
    }
}
