
import ElementObserver from './element-observer/element-observer-aggregate.js';
import AnimationLoop from './animation-loop.js';
import Drawer from './drawing/drawer.js';

export default class LazyCanvas {
    constructor(...args) { LazyCanvas.prototype.create.call(...args); };
}

LazyCanvas.prototype.set_canvas = function(canvas) {
    this.canvas = canvas;
    return this;
};

LazyCanvas.prototype.set_pixel_ratio_multiplier = function(pixel_ratio_multiplier) {
    this.pixel_ratio_multiplier = pixel_ratio_multiplier;
    return this;
};
LazyCanvas.prototype.turn_pixel_ratio_auto = function() {
    this.pixel_ratio_auto = true;
    this.update_pixel_ratio_auto();
    return this;
};
LazyCanvas.prototype.turn_pixel_ratio_manual = function() {
    this.pixel_ratio_auto = false;
    this.update_pixel_ratio_manual();
    return this;
};

LazyCanvas.prototype.add_events = function(events) {
    this.element_observer.add_events(events);
};
LazyCanvas.prototype.remove_events = function(events) {
    this.element_observer.remove_events(events);
};
LazyCanvas.prototype.set_events = function(events) {
    this.element_observer.set_events(events);
};
LazyCanvas.prototype.clear_events = function() {
    this.element_observer.clear_events();
};
LazyCanvas.prototype.set_prefix = function(prefix) {
    this.element_observer.set_prefix(prefix);
    return this;
};
LazyCanvas.prototype.set_postfix = function(postfix) {
    this.element_observer.set_postfix(postfix);
    return this;
};



// Implementation

LazyCanvas.prototype.create = function(canvas, ...args) {
    this.canvas = canvas;
    if (!canvas)
        throw new Error(`LazyCanvas: canvas must be given in constructor`);

    this.pixel_ratio_auto = true;
    this.device_pixel_ratio = 1.0;
    this.pixel_ratio = 1.0;
    this.pixel_ratio_multiplier = 1.0;

    this.event = {};
    let events = null;

    this.renderer_type = '2d';
    
    for (const arg of args) {
        if (arg instanceof AnimationLoop) {
            this.animation_loop = arg;
        } else if (arg instanceof Array) {
            events = arg;
        } else if (arg instanceof ElementObserver) {
            this.element_observer = arg;
        } else if (typeof arg === 'string') {
            this.renderer_type = arg;
        }
    }
    if (!this.animation_loop) {
        this.animation_loop = new AnimationLoop();
        this.animation_loop.start();
    }
    if (!this.element_observer) {
        this.element_observer = new ElementObserver();
        // 'resize', 'mouse_all', 'touch_all'
        this.element_observer.observe(this.canvas, this.event, events);
    }
    
    this.draw = new Drawer(this.canvas, this.renderer_type);

    this.animation_loop.add_on_update(function(dt, elapsed) {
        const canvas = this.canvas;
        this.update_pixel_ratio_auto();
        const actual_width = canvas.clientWidth * this.pixel_ratio;
        const actual_height = canvas.clientHeight * this.pixel_ratio;
        if (canvas.width != actual_width || canvas.height != actual_height) {
            canvas.width = actual_width;
            canvas.height = actual_height;
        }
        this.drawer.render(dt, elapsed);
    }.bind(this));
};

LazyCanvas.prototype.update_pixel_ratio_auto = function() {
    if (this.device_pixel_ratio == window.devicePixelRatio)
        return false;
    this.device_pixel_ratio = window.devicePixelRatio;
    const pr = this.device_pixel_ratio;
    if (pr < 4/3) {
        this.pixel_ratio = pr;
    } else if (pr >= 4/3 && pr < 2) {
        this.pixel_ratio = pr * 3/4;
    } else if (pr >= 2 && pr < 3) {
        this.pixel_ratio = pr * 1/2;
    } else if (pr >= 3 && pr < 4) {
        this.pixel_ratio = pr * 1/3;
    } else {
        this.pixel_ratio = pr * 1/4;
    }
    this.pixel_ratio *= this.pixel_ratio_multiplier;
    return true;
};

LazyCanvas.prototype.update_pixel_ratio_manual = function() {
    this.device_pixel_ratio = 0;
    this.pixel_ratio = this.pixel_ratio_multiplier;
};
