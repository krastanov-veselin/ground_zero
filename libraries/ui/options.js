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
