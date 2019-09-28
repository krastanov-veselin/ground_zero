'use strict';

class Ground {
    constructor() {
        
    }
    
    random(min = 0, max = 0) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
