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
