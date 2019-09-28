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
