
import StyleManager from './style/style-manager.js';
import common_style from './style/common-style.js';

import TransformPipe from '../data-structures/transform-pipe.js';

export default class Drawer {
    constructor(...args) { this.create(...args); };
}

Drawer.prototype.render = function() {

};

Drawer.prototype.add_line = function(x, y, style) {

};



// Implementation

Drawer.prototype.create = function(...args) {
    this.transform = new TransformPipe();
    this.final_stretch = 1.0;

    this.style = new StyleManager();
    common_style(this.style);

    this.renderer = null;
};