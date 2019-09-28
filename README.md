## Welcome to Ground Zero
![alt text](./github_images/name_cover.jpg)

Project name is inspired by Grimoire of Zero, so say Hi to Zero as well!
- No copyrights owned for the image above!

### The UI lib focused on complex stateful animations and high performance scaling of nodes in a rapid mutable environment that runs like magic! :O

This is a new project directly started as open source, so it's a work in progress at this time so new content will be added on a daily basis, expect a stable release really soon!
You can also contact me via veselin.krastanov.zero@gmail.com to discuss contribution.

## What is done so far that is stable and ready to use? Basic Usage:

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

const appName = new Pointer("myList", "main", "appName");

// This event get triggered regardless of which pointer to the same location issued the mutation
appName.onUpdate = (newValue, oldValue) => {
    console.log(newValue);
}

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
        return this.div({}, [
            
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
    display() {
        const name = new Pointer("myList", "main", "appName");
        const active = new Pointer("myList", "main", "active");
        const active2 = new Pointer("myList", "main", "active2");
        
        return this.div({}, [
            this.div({
                text: "Optional Original Text",
                style: "opacity: 1; background-color: #333", // Some optional original style
                className: "active active2", // Some optional original classnames
                
                stateText: this.state(name, update => update(name.value)),
                stateStyle: this.state([active, active2], update => update([
                    this.value("opacity", active === false && active2 === true ? 1 : 0),
                    this.value("background-color", active === true ? "#555" : "#999"),
                ])),
                stateClass: this.state([active, active2], update => update([
                    this.value("active", active.value), // adds or removes className "active"
                    this.value("active2", active2.value) // adds or removes className "active2"
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
                MySubComponent, {}, "mySubComponent"
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
                MySubComponent, {}, "mySubComponent"
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
