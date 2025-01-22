
// Manages requestAnimationFrame and calculating elapsed time, providing onstart, onloop, onstop callbacks

import { reduce_arrays, append_unique_to, append_unique_to_begin, remove_elements_from } from './algorithms/array-mods.js';

export default class AnimationLoop {
    constructor() { AnimationLoop.prototype.create.call(this); };
}

AnimationLoop.prototype.add_on_start = function(...callbacks) {
    this.add_callbacks(this.on_start, ...callbacks);
    return this;
};
AnimationLoop.prototype.add_on_start_begin = function(...callbacks) {
    this.add_callbacks_begin(this.on_start, ...callbacks);
    return this;
};
AnimationLoop.prototype.remove_on_start = function(callbacks) {
    this.remove_callbacks(this.on_start, ...callbacks);
    return this;
};

AnimationLoop.prototype.add_on_update = AnimationLoop.prototype.add_on_tick = AnimationLoop.prototype.add_on_loop = function(...callbacks) {
    this.add_callbacks(this.on_update, ...callbacks);
    return this;
};
AnimationLoop.prototype.add_on_update_begin = AnimationLoop.prototype.add_on_tick_begin = AnimationLoop.prototype.add_on_loop_begin = function(...callbacks) {
    this.add_callbacks_begin(this.on_update, ...callbacks);
    return this;
};
AnimationLoop.prototype.remove_on_update = AnimationLoop.prototype.remove_on_tick = AnimationLoop.prototype.remove_on_loop = function(...callbacks) {
    this.remove_callbacks(this.on_update, ...callbacks);
    return this;
};

AnimationLoop.prototype.add_on_stop = function(...callbacks) {
    this.add_callbacks(this.on_stop, ...callbacks);
    return this;
};
AnimationLoop.prototype.add_on_stop_begin = function(...callbacks) {
    this.add_callbacks_begin(this.on_stop, ...callbacks);
    return this;
};
AnimationLoop.prototype.remove_on_stop = function(...callbacks) {
    this.remove_callbacks(this.on_stop, ...callbacks);
    return this;
};

AnimationLoop.prototype.trigger = function() {
    if (this.manual_update_scheduled)
        return;
    this.manual_update();
};

AnimationLoop.prototype.start = function(start_time) {
    this.auto_update = true;
    if (this.requestAnimationFrameId)
        return;
    if (start_time)
        this.start_time = start_time;
    else
        this.start_time = Date.now();
    
    this.elapsed = 0;
    this.elapsed_prev = 0;
    this.dt = 0;
    
    for (const callback of this.on_start) {
        callback(this.start_time);
    }
    const update = function() {
        this.update();
        this.requestAnimationFrameId = window.requestAnimationFrame(update);
        //this.requestAnimationFrameId = window.setTimeout(update, 1000/60)
    }.bind(this);
    update();
    return this;
};

AnimationLoop.prototype.stop = function() {
    this.auto_update = false;
    if (!this.requestAnimationFrameId)
        return this.start_time;
    for (const callback of this.on_stop) {
        callback(this.elapsed);
    }
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    //window.clearTimeout(this.requestAnimationFrameId);
    this.requestAnimationFrameId = null;
    return this.start_time;
};



// implementation

AnimationLoop.prototype.create = function() {
    this.on_start = [];
    this.on_update = [];
    this.on_stop = [];
    
    this.start_time = Date.now();
    this.elapsed = 0;
    this.elapsed_prev = 0;
    this.dt = 0;
    
    this.auto_update = false;
    this.manual_update_scheduled = false;
    this.manual_update_last_time = 0;
    this.manual_update_interval = 1000/60;

    this.requestAnimationFrameId = null;
};

AnimationLoop.prototype.add_callbacks = function(target, ...callbacks) {
    append_unique_to(target, ...reduce_arrays(callbacks));
};
AnimationLoop.prototype.add_callbacks_begin = function(target, ...callbacks) {
    append_unique_to_begin(target, ...reduce_arrays(callbacks));
};
AnimationLoop.prototype.remove_callbacks = function(target, ...callbacks) {
    remove_elements_from(target, ...reduce_arrays(callbacks));
};

AnimationLoop.prototype.update = function() {
    this.elapsed_prev = this.elapsed;
    this.elapsed = Date.now() - this.start_time;
    this.dt = this.elapsed - this.elapsed_prev;
    for (const callback of this.on_update) {
        callback(this.dt, this.elapsed);
    }
};

AnimationLoop.prototype.manual_update = function() {
    if (this.auto_update)
        return;
    const time = Date.now();
    const dt = (time - this.manual_update_last_time);
    //console.log(dt);
    if (dt >= this.manual_update_interval) {
        this.manual_update_last_time = time;
        this.update();
        this.manual_update_scheduled = false;
    } else {
        this.manual_update_scheduled = true;
        window.setTimeout(this.manual_update.bind(this), this.manual_update_interval - dt);
    }
};

if (window) {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000/60);
            };
        })();
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (window.cancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
            window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
            window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
            window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
            window.clearTimeout);
    }
}
