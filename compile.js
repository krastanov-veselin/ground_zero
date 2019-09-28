const order = [
    "objects/zero.js",
    "libraries/data/data_types.js",
    "libraries/data/list.js",
    "libraries/data/item.js",
    "libraries/data/list_pointer.js",
    "libraries/data/pointer.js",
    "libraries/data/data.js",
    "libraries/ui/shortcuts.js",
    "libraries/ui/options.js",
    "libraries/ui/ui.js",
    "libraries/ui/transform.js",
    "libraries/ui/nodes.js",
    "libraries/ui/list.js",
    "libraries/ui/interactive.js",
    "libraries/ui/interactive/move.js",
    "libraries/ui/interactive/drag.js",
    "libraries/ui/interactive/drop.js",
    "libraries/ui/interactive/resize.js",
    "libraries/ui/interactive/rotate.js",
    "libraries/ui/interactive/scale.js",
    "libraries/ui/interactive/skew.js",
    "libraries/ui/interactive/sort.js",
    "libraries/ui/interactive/padding.js",
    "export.js",
];

/** @type {string[]} */
const compilation = [];

const fs = require("fs");

for (let i = 0; i < order.length; i++) {
    compilation.push(fs.readFileSync("./" + order[i], "utf8"));
}

fs.writeFileSync("./build.js", compilation.join(""));

console.log("Done");
