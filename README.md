## Welcome to Ground Zero

This is a new project directly started as open source, so it's a work in progress at this time so new content will be added on a daily basis, expect a stable release really soon!
You can also contact me via veselin.krastanov.zero@gmail.com to discuss contribution.

## What is done so far that is stable and ready to use? Basic Usage:

### Non-diffing virtual dom concept based on a subscribe-update databinding methodology.
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

myList.onAdd = (id) => {
    console.log(myList.item(id));
}

// Updates all binded lists
// Second param is optional, this is why design wise it's after the object insertion
myList.add({
    appName: "MyCoolApp"
}, "main");

const appName = new Pointer("myList", "main", "appName");

appName.onUpdate = (newValue, oldValue) => {
    console.log(newValue);
}

// Updates all UI bindings in a DOM update batch so it generates only 1 repaint
appName.value = "MyCoolApp2";
```

### A basic Component
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
```

