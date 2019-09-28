'use strict';

class Ground {
    constructor() {
        
    }
    
    random(min = 0, max = 0) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
class Pos {
    constructor(/** @type {Pos} */ data = {}) {
        this.x = typeof data.x === "undefined" ? 0 : data.x;
        this.y = typeof data.y === "undefined" ? 0 : data.y;
    }
}

class Size {
    constructor(/** @type {Size} */ data = {}) {
        this.x = typeof data.x === "undefined" ? 0 : data.x;
        this.y = typeof data.y === "undefined" ? 0 : data.y;
    }
}
'use strict';

class List extends Ground {
    constructor(id) {
        super();
        
        this.id = id;
        /** @type {Map<string, Item>} */
        this.items = new Map();
        /** @type {ListPointer[]} */
        this.pointers = [];
        /** @type {Map<string, boolean>} */
        this.appliedEventIDs = new Map();
    }
    
    add(structure = {}, id = "") {
        if (id.length === 0) {
            id = performance.now() + "_" + this.random(1, 99999);
        }
        
        this.items.set(id, new Item(id, structure));
        
        this.broadcastAdd(id);
    }
    
    remove(id = "") {
        this.items.delete(id);
        
        this.broadcastRemove(id);
    }
    
    sort(elementID1 = "", elementID2 = "", type = 0) {
        this.broadcastSort(elementID1, elementID2, type);
    }
    
    unmount() {
        this.broadcastUnmount();
    }
    
    broadcastAdd(id) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onAdd(id);
        }
    }
    
    broadcastRemove(id) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onRemove(id);
        }
    }
    
    broadcastSort(elementID1 = "", elementID2 = "", type = 0) {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onSort(elementID1, elementID2, type);
        }
    }
    
    broadcastUnmount() {
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].onUnmount(id);
        }
    }
}
'use strict';

class Item extends Ground {
    constructor(id = "", data = {}) {
        super();
        
        this.id = id;
        this.data = data;
        /** @type {Map<string, Pointer[]>} */
        this.pointers = new Map();
    }
    
    update(prop = "", newValue = null) {
        const oldValue = this.data[prop];
        
        this.data[prop] = newValue;
        
        this.broadcast(prop, newValue, oldValue);
    }
    
    broadcast(prop, newValue, oldValue) {
        if (this.pointers.has(prop) === false) {
            return;
        }
        
        const pointers = this.pointers.get(prop);
        
        for (let i = 0; i < pointers.length; i++) {
            pointers[i].onUpdate(newValue, oldValue);
        }
    }
}
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
        
        this.eventID = eventID.length !== 0 ? eventID : "listEvent_" + performance.now() + "_" + this.random(1, 99999);
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
'use strict';

class Pointer extends Ground {
    constructor(listID = "", itemID = "", prop = "", onUpdate = null, onUnmount = null, autoMount = true) {
        super();
        
        this.listID = listID;
        this.itemID = itemID;
        this.prop = prop;
        this.onUnmount = onUnmount;
        this.onUpdate = onUpdate;
        this.mounted = false;
        this.uniqueID = performance.now() + "_" + this.random(1, 99999);
        
        if (autoMount) {
            this.mount();
        }
    }
    
    get item() {
        return Data.lists.get(this.listID).items.get(this.itemID);
    }
    
    get value() {
        return this.item.data[this.prop];
    }
    
    set value(newValue = null) {
        if (this.mounted === false) {
            return;
        }
        
        this.item.update(this.prop, newValue);
    }
    
    update() {
        this.value = this.value;
    }
    
    broadcast() {
        this.item.broadcast();
    }
    
    mount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.items.has(this.itemID) === false) {
            this.mounted = false;
            
            return;
        }
        
        if (this.onUpdate !== null) {
            if (this.item.pointers.has(this.prop) === false) {
                this.item.pointers.set(this.prop, []);
            }
            
            this.item.pointers.get(this.prop).push(this);
        }
        
        this.mounted = true;
    }
    
    unmount() {
        if (Data.lists.has(this.listID) === false) {
            this.mounted = false;
            
            return;
        }
        
        const list = Data.lists.get(this.listID);
        
        if (list.items.has(this.itemID) === false) {
            this.mounted = false;
            
            return;
        }
        
        if (this.onUpdate !== null) {
            if (this.item.pointers.has(this.prop) === false) {
                this.mounted = false;
                
                return;
            }
            
            const siblings = this.item.pointers.get(this.prop);
            
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].uniqueID === this.uniqueID) {
                    siblings.splice(i, 1);
                    
                    break;
                }
            }
        }
        
        this.mounted = false;
    }
}
'use strict';

const Data = {
    /** @type {Map<string, List>} */
    lists: new Map(),
    create: (id = "") => {
        if (Data.lists.has(id)) {
            console.warn("Trying to add list with already existing listID.");
            
            return;
        }
        
        const list = new List(id);
        
        Data.lists.set(id, list);
    },
    remove: (id = "") => {
        if (Data.lists.has(id) === false) {
            console.warn("Trying to remove nonexisting list.");
            
            return;
        }
        
        Data.lists.get(id).unmount();
        
        Data.lists.delete(id);
    }
};
'use strict';

class ShortcutsUI extends Ground {
    constructor() {
        super();
    }
    
    /** @abstract Method is abstract, implemented in UI class */
    create(type = "", options = new OptionsUI(), /** @type {Array<NodeUI|null>} */ children = []) {}
    
    div(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("div", new OptionsUI(options ? options : {}), children) }
    span(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("span", new OptionsUI(options ? options : {}), children) }
    a(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("a", new OptionsUI(options ? options : {}), children) }
    li(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("li", new OptionsUI(options ? options : {}), children) }
    ul(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("ul", new OptionsUI(options ? options : {}), children) }
    p(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("p", new OptionsUI(options ? options : {}), children) }
    form(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("form", new OptionsUI(options ? options : {}), children) }
    input(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("input", new OptionsUI(options ? options : {}), children) }
    textarea(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("textarea", new OptionsUI(options ? options : {}), children) }
    button(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("button", new OptionsUI(options ? options : {}), children) }
    video(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("video", new OptionsUI(options ? options : {}), children) }
    audio(/** @type {OptionsUI} */ options = null, /** @type {Array<NodeUI|null>} */ children = []) { return this.create("audio", new OptionsUI(options ? options : {}), children) }
}
'use strict';

class OptionsUI extends Ground {
    constructor(/** @type {OptionsUI} */ data = {}) {
        super();
        
        /** @type {string} */ this.name = typeof data.name === "undefined" ? "" : data.name;
        
        /** @type {string} */ this.text = typeof data.text === "undefined" ? "" : data.text;
        /** @type {string} */ this.style = typeof data.style === "undefined" ? "" : data.style;
        /** @type {string} */ this.className = typeof data.className === "undefined" ? "" : data.className;
        
        /** @type {NodeState} */ this.stateText = typeof data.stateText === "undefined" ? null : data.stateText;
        /** @type {NodeState} */ this.stateStyle = typeof data.stateStyle === "undefined" ? null : data.stateStyle;
        /** @type {NodeState} */ this.stateClass = typeof data.stateClass === "undefined" ? null : data.stateClass;
        
        /** @type {string} */ this.type = typeof data.type === "undefined" ? "" : data.type;
        /** @type {string} */ this.value = typeof data.value === "undefined" ? "" : data.value;
        
        /** @type {NodeState} */ this.stateValue = typeof data.stateValue === "undefined" ? null : data.stateValue;
        
        /** @type {Function} */ this.onClick = typeof data.onClick === "undefined" ? null : data.onClick;
        /** @type {Function} */ this.onDoubleClick = typeof data.onDoubleClick === "undefined" ? null : data.onDoubleClick;
        /** @type {Function} */ this.onMouseDown = typeof data.onMouseDown === "undefined" ? null : data.onMouseDown;
        /** @type {Function} */ this.onMouseUp = typeof data.onMouseUp === "undefined" ? null : data.onMouseUp;
        /** @type {Function} */ this.onMouseMove = typeof data.onMouseMove === "undefined" ? null : data.onMouseMove;
        /** @type {Function} */ this.onMouseEnter = typeof data.onMouseEnter === "undefined" ? null : data.onMouseEnter;
        /** @type {Function} */ this.onMouseLeave = typeof data.onMouseLeave === "undefined" ? null : data.onMouseLeave;
        /** @type {Function} */ this.onMouseOver = typeof data.onMouseOver === "undefined" ? null : data.onMouseOver;
        /** @type {Function} */ this.onMouseOut = typeof data.onMouseOut === "undefined" ? null : data.onMouseOut;
        /** @type {Function} */ this.onRightClick = typeof data.onRightClick === "undefined" ? null : data.onRightClick;
        /** @type {Function} */ this.onKeyUp = typeof data.onKeyUp === "undefined" ? null : data.onKeyUp;
        /** @type {Function} */ this.onKeyDown = typeof data.onKeyDown === "undefined" ? null : data.onKeyDown;
        /** @type {Function} */ this.onScroll = typeof data.onScroll === "undefined" ? null : data.onScroll;
        /** @type {Function} */ this.onMouseWheel = typeof data.onMouseWheel === "undefined" ? null : data.onMouseWheel;
        /** @type {Function} */ this.onSubmit = typeof data.onSubmit === "undefined" ? null : data.onSubmit;
        /** @type {Function} */ this._onSubmit = typeof data._onSubmit === "undefined" ? null : data._onSubmit;
    }
}
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
        data = () => {}, 
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
'use strict';

class Transform extends Ground {
    constructor(node = new NodeUI()) {
        super();
        
        this.node = node;
        this.matrix = [
            [0, 0, 0], // 3D Translation
            [0, 0, 0], // 3D Rotation
            [1, 1], // 2D Scale
            [0, 0], // 2D Skew
            [0, 0, 0], // 3D Size
            [0, 0], // 2D Padding
            [0, 0], // 2D Margin
            [0, 0], // 2D Border
            [0, 0, 0, 0], // 4 Angle Border Radius
            [0], // Global Average Border Radius
        ];
    }
    
    translateX(x = 0, apply = true) {
        this.matrix[0][0] = x;
        
        if (apply) {
            this.apply();
        }
    }
    
    translateY(y = 0, apply = true) {
        this.matrix[0][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    translateZ(z = 0, apply = true) {
        this.matrix[0][2] = z;
        
        if (apply) {
            this.apply();
        }
    }
    
    translateXY(x = 0, y = 0, apply = true) {
        this.matrix[0][0] = x;
        this.matrix[0][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    translate(x = 0, y = 0, z = 0, apply = true) {
        this.matrix[0][0] = x;
        this.matrix[0][1] = y;
        this.matrix[0][2] = z;
        
        if (apply) {
            this.apply();
        }
    }
    
    rotateX(x = 0, apply = true) {
        this.matrix[1][0] = x;
        
        if (apply) {
            this.apply();
        }
    }
    
    rotateY(y = 0, apply = true) {
        this.matrix[1][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    rotateZ(z = 0, apply = true) {
        this.matrix[1][2] = z;
        
        if (apply) {
            this.apply();
        }
    }
    
    rotateXY(x = 0, y = 0, apply = true) {
        this.matrix[1][0] = x;
        this.matrix[1][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    rotate(x = 0, y = 0, z = 0, apply = true) {
        this.matrix[1][0] = x;
        this.matrix[1][1] = y;
        this.matrix[1][2] = z;
        
        if (apply) {
            this.apply();
        }
    }
    
    scaleX(x = 0, apply = true) {
        this.matrix[2][0] = x;
        
        if (apply) {
            this.apply();
        }
    }
    
    scaleY(y = 0, apply = true) {
        this.matrix[2][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    scale(x = 0, y = 0, apply = true) {
        this.matrix[2][0] = x;
        this.matrix[2][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    skewX(x = 0, apply = true) {
        this.matrix[3][0] = x;
        
        if (apply) {
            this.apply();
        }
    }
    
    skewY(y = 0, apply = true) {
        this.matrix[3][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    skew(x = 0, y = 0, apply = true) {
        this.matrix[3][0] = x;
        this.matrix[3][1] = y;
        
        if (apply) {
            this.apply();
        }
    }
    
    updateMatrix(
        trX = 0,
        trY = 0,
        trZ = 0,
        roX = 0,
        roY = 0,
        roZ = 0,
        scX = 0,
        scY = 0,
        skX = 0,
        skY = 0,
        apply = true
    ) {
        this.translate(trX, trY, trZ, false);
        this.rotate(roX, roY, roZ, false);
        this.scale(scX, scY, false);
        this.skew(skX, skY, false);
        
        if (apply) {
            this.apply();
        }
    }
    
    sizeX(x = 0, apply = true) {
        this.matrix[4][0] = x;
        
        if (apply) {
            this.applySize();
        }
    }
    
    sizeY(y = 0, apply = true) {
        this.matrix[4][1] = y;
        
        if (apply) {
            this.applySize();
        }
    }
    
    sizeZ(z = 0, apply = true) {
        this.matrix[4][2] = z;
        
        if (apply) {
            this.applySize();
        }
    }
    
    sizeXY(x = 0, y = 0, apply = true) {
        this.matrix[4][0] = x;
        this.matrix[4][1] = y;
        
        if (apply) {
            this.applySize();
        }
    }
    
    size(x = 0, y = 0, z = 0, apply = true) {
        this.matrix[4][0] = x;
        this.matrix[4][1] = y;
        this.matrix[4][2] = z;
        
        if (apply) {
            this.applySize();
        }
    }
    
    apply() {
        this.node.node.style.transform = 
            "translate3d(" + this.matrix[0][0] + "px, " + this.matrix[0][1] + "px, " + this.matrix[0][2] + "px) " + 
            "rotateX(" + this.matrix[1][0] + "deg) " + 
            "rotateY(" + this.matrix[1][1] + "deg) " + 
            "rotateZ(" + this.matrix[1][2] + "deg) " + 
            "scaleX(" + this.matrix[2][0] + ") " + 
            "scaleY(" + this.matrix[2][1] + ") " + 
            "skewX(" + this.matrix[3][0] + "deg) " + 
            "skewY(" + this.matrix[3][1] + "deg)";
    }
    
    applySize() {
        this.node.node.style.width = this.matrix[4][0] + "px";
        this.node.node.style.height = this.matrix[4][1] + "px";
    }
}
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
    
    enable(sizePointer = new Pointer(), posPointer = new Pointer()) {
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
            "resize_size", 
            new Pointer(
                sizePointer.listID, 
                sizePointer.itemID, 
                sizePointer.prop, 
                sizeFunc
            )
        );
        
        this.interactive.ui.propPointers.set(
            "resize_pos", 
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
'use strict';

class Rotate extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
    }
}
'use strict';

class Scale extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
    }
}
'use strict';

class Skew extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
    }
}
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
/** @todo Has to be reinvented from previous version */

class Padding extends InteractiveLibrary {
    constructor(interactive = new InteractiveUI()) {
        super(interactive);
    }
    
    enable() {
        
    }
    
    disable() {
        
    }
    
    unmount() {
        this.disable();
    }
}
module.exports = {
    Data: Data,
    UI: UI,
    Pos: Pos,
    Size: Size
};
