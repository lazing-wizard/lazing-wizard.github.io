
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

AnimationLoop.prototype.start = function(start_time) { const animationLoop = this;
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
        animationLoop.elapsed_prev = animationLoop.elapsed;
        animationLoop.elapsed = (Date.now() - animationLoop.start_time);
        animationLoop.dt = animationLoop.elapsed - animationLoop.elapsed_prev;
        for (const callback of animationLoop.on_update) {
            callback(animationLoop.dt, animationLoop.elapsed);
        }
        animationLoop.requestAnimationFrameId = window.requestAnimationFrame(update);
        //animationLoop.requestAnimationFrameId = window.setTimeout(update, 1000/60)
    };
    update();
    return this;
};

AnimationLoop.prototype.stop = function() {
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
    
    this.start_time = null;
    this.elapsed = null;
    this.elapsed_prev = null;
    this.dt = null;
    
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