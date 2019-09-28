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
