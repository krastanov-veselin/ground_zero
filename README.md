## Welcome to Ground Zero
![alt text](./github_images/name_cover.jpg)

Project name is inspired by Grimoire of Zero, so say Hi to Zero as well!
- No copyrights owned for the image above!

### The UI lib focused on complex stateful animations and high performance scaling of nodes in a rapid mutable environment that runs like magic! :O

```
npm install ground_zero
```

```js
const { UI, Data, Pos, Size } = require("ground_zero");
```

This is a new project directly started as open source, so it's a continuous work in progress and new content may be added on a daily basis until reaching a stable release, so do expect a stable release really soon! ... And if you don't ... I'LL BE MAD BRO/SIS! And Zero will be Mad too!!

You can also contact me via veselin.krastanov.zero@gmail.com to discuss contribution.

## In case of bugs please use the issues section here, updates are very frequent and so are responses, thanks!
## TypeScript version is also comming it's way here, stay tuned!

## What is done so far that is stable and ready to use?

### Non-diffing virtual dom concept based on a subscribe-update databinding methodology.
#### Constant memory leak unit testing. All combinations of all features async and sync produce Zero memory leaks. Before every minor update memory leak unit testing is initialised, so it's safe to play with it, hoho.

```
UI Data layout

list[
    key: item[
        prop: value
    ]
]

Usage concept

Pointer - points to a listID->itemID->prop
    Handles[
        mutation[
            setValue
            getValue
        ]
        events[
            onUpdate
        ]
    ]

ListPointer - points to listID
    Handles[
        mutation[
            addItem
            removeItem
            sort
        ]
        events[
            onAddItem
            onRemoveItem
            onSort
        ]
    ]

UI has premade data:
    "ui": [
        "main": {
            ...
        }
    ]
```

### A basic Data Tree usage
```js
Data.create("myList");

const myList = new ListPointer("myPointerID", "myList");

// These events get triggered regardless of which listPointer to the same location issued the mutation
myList.onAdd = (id) => {
    console.log(myList.item(id));
}

myList.onRemove = (id) => {
    console.log("Removed item", id);
}

myList.onSort = (targetID, movingID, position) => {
    if (position === 0) {
        console.log(movingID, targetID);
    } else {
        console.log(targetID, movingID);
    }
}

// Updates all binded lists
// Second param is optional, this is why design wise it's after the object insertion
myList.add({
    appName: "MyCoolApp",
    active: false,
    active2: true
}, "main");

const appName = new Pointer("myList", "main", "appName", (newValue, oldValue) => {
    // This event get triggered regardless of which pointer to the same location issued the mutation
    console.log(newValue, oldValue);
});

// Updates all UI bindings in a DOM update batch so it generates only 1 repaint
appName.value = "MyCoolApp2";
```

### A basic Component + Initialisation
```js
class MyComponent extends UI {
    // Optional
    beforeMount() {
        // This get's called before display()
    }
    
    // Optional
    mounted() {
        // Get's called after display() when component is mounted in both the 
        // UI memory and the DOM memory.
        // And all it's options are setup.
    }
    
    // Optional
    onUnmount(unmount) {
        // Unmounts when this function is called, supporting async unmounting
        // Especially when it comes to animations
        unmount();
    }
    
    // Optional, if not declared then defaults to a normal, empty <div></div>
    display() {
        return this.div({
            text: "Hello World!"
        }, [
            
        ]);
    }
}

class MyCoolApplicationArchitecture {
    constructor() {
        /** @type {MyComponent} */
        this.view = null;
    }
    
    run() {
        this.view = new MyComponent();
        this.view.initialise(".app");
        // Magic happens!
    }
}

const app = new MyCoolApplicationArchitecture();

app.run();
```

### Component Nesting
```js
class MyComponent extends UI {
    mounted() {
        /** @type {MySubComponent} */
        const subComponent = this.elements.get("mySubComponent");
        
        console.log(subComponent);
        
        setTimeout(() => {
            subComponent.unmount(); // Get's removed and entirely, garbage collected and on going animations handled
        }, 5000);
    }
    
    display() {
        return this.div({}, [
            this.element(MySubComponent, {}, "mySubComponent")
        ]);
    }
}

class MySubComponent extends UI {
    display() {
        return this.div({
            text: "Hello World!"
        }, [
            
        ]);
    }
}
```

### Node State
Inheriting the "A basic Data Tree usage" guide
```js
class MyComponent extends UI {
    constructor(...p) {
        super(...p);
        
        this.name = new Pointer("myList", "main", "appName");
        this.active = new Pointer("myList", "main", "active");
        this.active2 = new Pointer("myList", "main", "active2");
    }
    
    mounted() {
        setTimeout(() => {
            this.active.value = true;
            this.active2.value = false;
        }, 2000);
    }
    
    display() {
        return this.div({}, [
            this.div({
                text: "Optional Original Text",
                style: "opacity: 1; background-color: #333; width: 100px; height: 100px;", // Some optional original style
                className: "active active2", // Some optional original classnames
                
                stateText: this.state(this.name, update => update(this.name.value)),
                stateStyle: this.state([this.active, this.active2], update => update([
                    this.value("opacity", this.active.value === true && this.active2.value === false ? 1 : 0),
                    this.value("background-color", this.active.value === true ? "#555" : "#999"),
                ])),
                stateClass: this.state([this.active, this.active2], update => update([
                    this.value("active", this.active.value), // adds or removes className "active"
                    this.value("active2", this.active2.value) // adds or removes className "active2"
                ]))
            })
        ]);
    }
}
```

### Component Mount State
Inheriting the "A basic Data Tree usage" guide
```js
class MyComponent extends UI {
    constructor(...p) {
        super(...p);
        
        this.active = new Pointer("myList", "main", "active");
        this.active2 = new Pointer("myList", "main", "active2");
    }
    
    mounted() {
        this.active.value = true;
        this.active2.value = false;
        // Element mounted at this point
        
        setTimeout(() => {
            this.active.value = false;
            this.active2.value = true;
            // Element unmounted at this point
        }, 5000);
    }
    
    display() {
        return this.div({}, [
            this.stateMount(
                [this.active, this.active2], 
                () => this.active.value === true && this.active2.value === false, 
                MySubComponent, () => {}, "mySubComponent"
            )
        ]);
    }
}

class MySubComponent extends UI {
    display() {
        return this.div({
            text: "Hello World!"
        }, [
            
        ]);
    }
}
```

### Component Mount Position State
Inheriting the "A basic Data Tree usage" guide
```js
class MyComponent extends UI {
    constructor(...p) {
        super(...p);
        
        this.active = new Pointer("myList", "main", "active");
        this.active2 = new Pointer("myList", "main", "active2");
    }
    
    mounted() {
        this.active.value = true;
        
        this.active2.value = false;
        // Element mounted at position "inactivePosition"
        
        setTimeout(() => {
            this.active2.value = true;
            // Element mounted at position "activePosition"
            setTimeout(() => {
                this.active.value = false;
                // Element unmounted
                setTimeout(() => {
                    this.active.value = true;
                    this.active2.value = false;
                    // Element mounted on another position
                }, 2000);
            }, 2000);
        }, 2000);
    }
    
    display() {
        return this.div({}, [
            this.statePosition([this.active2], "mySubComponent", () => !this.active2.value, "inactivePosition"),
            this.div({
                text: "Separator"
            }),
            this.statePosition([this.active2], "mySubComponent", () => this.active2.value, "activePosition"),
            this.stateMount(
                [this.active], 
                () => this.active.value === true, 
                MySubComponent, () => {}, "mySubComponent"
            ),
            this.div({
                text: "Another separator"
            })
        ]);
    }
}

class MySubComponent extends UI {
    display() {
        return this.div({
            text: "Hello World!"
        }, [
            
        ]);
    }
}
```

### State List
```js
Data.create("myItems");

const myItems = new ListPointer("myListPointer", "myItems");

for (let i = 0; i < 5; i++) {
    myItems.add({
        name: "item " + i,
        active: true,
        active2: false
    });
}

class MyElements extends UI {
    display() {
        return this.div({}, [
            this.div({
                text: "Add Item",
                onClick: () => myItems.add({
                    name: "item " + performance.now(),
                    active: true,
                    active2: false
                })
            }),
            this.list("myCoolListElement", this.div(), "myItems", MyElement),
            this.list("myCoolListElement2", this.div(), "myItems", MyElement),
        ]);
    }
}

class MyElement extends UI {
    display() {
        const name = new Pointer("myItems", this.options.id, "name");
        const active = new Pointer("myItems", this.options.id, "active");
        
        return this.div({
            style: "transition: opacity 1s;",
            stateStyle: this.state(active, update => update([
                this.value("opacity", active.value ? 1 : 0)
            ]))
        }, [
            this.input({
                stateValue: this.state(name, update => update(name.value)),
                onKeyDown: ev => setTimeout(() => name.value = ev.target.value, 0)
            }),
            this.div({
                text: "Remove",
                onClick: () => myItems.remove(this.options.id)
            })
        ]);
    }
}
```

### State Interactive: Move
```js
Data.create("myApp");

const appData = new ListPointer("myListPointer", "myApp");

appData.add({
    elementPos: new Pos() // Basically a vec3 {x: 0, y: 0, z: 0}
}, "main");

class MyElements extends UI {
    display() {
        return this.div({}, [
            this.element(MovingElement, {}, "movingElement1"), // Both elements share the same source of truth and will have same state in 60fps while dragging
            this.element(MovingElement, {}, "movingElement2")
        ]);
    }
}

class MovingElement extends UI {
    mounted() {
        this.interactive.move.enable(new Pointer("myApp", "main", "elementPos"), "MoveHandle");
        
        // Optional use in case of removing move
        // setTimeout(() => {
        //     this.interactive.move.disable();
        // }, 10000);
    }
    
    display() {
        return this.div({
            style: "background-color: #0001; width: 100px; height: 100%; margin: 5px;"
        }, [
            this.div({
                name: "MoveHandle",
                style: "height: 40px; background-color: #0001"
            }),
            this.div({
                style: "height: calc(100% - 40px)"
            })
        ]);
    }
}
```

### State Interactive: Resize
```js
Data.create("myApp");

const appData = new ListPointer("myListPointer", "myApp");

appData.add({
    elementPos: new Size(), // Basically a vec3 {x: 0, y: 0, z: 0}
    elementSize: new Size({
        x: 50,
        y: 50
    }) // Basically a vec3 {x: 0, y: 0, z: 0}
}, "main");

class MyElements extends UI {
    display() {
        return this.div({}, [
            this.element(MovingElement, {}, "movingElement1"), // Both elements share the same source of truth and will have same state in 60fps while resizing
            this.element(MovingElement, {}, "movingElement2")
        ]);
    }
}

class MovingElement extends UI {
    mounted() {
        this.interactive.resize.enable(new Pointer("myApp", "main", "elementSize"), new Pointer("myApp", "main", "elementPos"));
        
        // Optional use in case of removing resize
        // setTimeout(() => {
        //     this.interactive.resize.disable();
        // }, 10000);
    }
    
    display() {
        return this.div({
            style: "background-color: #0001; width: 100px; height: 100%; margin: 5px;"
        }, [
            
        ]);
    }
}
```

### State Interactive: Sort
```js
Data.create("myItems");

const myItems = new ListPointer("myListPointer", "myItems");

for (let i = 0; i < 20; i++) {
    myItems.add({
        name: "item " + i,
        active: true,
        active2: false
    });
}

class MyElements extends UI {
    display() {
        return this.div({}, [
            this.div({
                text: "Add Item",
                onClick: myItems.add({
                    name: "item " + performance.now(),
                    active: true,
                    active2: false
                })
            }),
            this.list("myCoolListElement", this.div(), "myItems", MyElement), // Will share the same sort order in real time due to same state source of truth
            this.list("myCoolListElement2", this.div(), "myItems", MyElement)
        ]);
    }
}

class MyElement extends UI {
    mounted() {
        this.interactive.sort.enable(new ListPointer("", "myItems"), "main");
        
        setTimeout(() => {
            this.interactive.sort.disable();
        }, 10000);
    }
    
    display() {
        const name = new Pointer("myItems", this.options.id, "name");
        
        return this.div({
            stateText: this.state(name, update => update(name.value)),
        }, [
            
        ]);
    }
}
```

### State Interactive: Drag + Drop
```js
class ItemStructure {
    constructor(/** @type {ItemStructure} */ data = {}) {
        this.name = typeof data.name === "undefined" ? "" : data.name;
        this.active = typeof data.active === "undefined" ? false : data.active;
        this.active2 = typeof data.active2 === "undefined" ? false : data.active2;
    }
}

Data.create("myItems");

const myItems = new ListPointer("myListPointer", "myItems");

for (let i = 0; i < 20; i++) {
    myItems.add(new ItemStructure({
        name: "item " + i,
        active: true,
        active2: false
    }));
}

class MyElements extends UI {
    mounted() {
        this.interactive.drop.enable("DropArea", [ItemStructure], (item) => {
            console.log("dropped", item);
        });
    }
    
    display() {
        return this.div({}, [
            this.div({
                text: "Drop Area",
                name: "DropArea",
                style: "height: 200px; background-color: #0001;"
            }),
            this.list("myCoolListElement", this.div(), "myItems", MyElement)
        ]);
    }
}

class MyElement extends UI {
    mounted() {
        this.interactive.drag.enable("main", "#0001");
        
        // Optional use in case of removing drag
        // setTimeout(() => {
        //     this.interactive.drag.disable();
        // }, 10000);
    }
    
    display() {
        const name = new Pointer("myItems", this.options.id, "name");
        
        return this.div({
            stateText: this.state(name, update => update(name.value)),
        }, [
            
        ]);
    }
}
```

## Next steps in Interactive are [rotate, scale, skew, padding, margin, fontColor, border, borderRadius, backgroundColor]
