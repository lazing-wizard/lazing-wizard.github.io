
// Manages requestAnimationFrame and calculating elapsed time, providing onstart, onloop, onstop callbacks

function AnimationLoop() { this.create(); }

AnimationLoop.prototype.add_on_start = function(callback) {
    this.add_callback(callback, this.on_start);
}
AnimationLoop.prototype.remove_on_start = function(callback) {
    this.remove_callback(callback, this.on_start);
}

AnimationLoop.prototype.add_on_update = AnimationLoop.prototype.add_on_tick = AnimationLoop.prototype.add_on_loop = function(callback) {
    this.add_callback(callback, this.on_update);
}
AnimationLoop.prototype.remove_on_update = AnimationLoop.prototype.remove_on_tick = AnimationLoop.prototype.remove_on_loop = function(callback) {
    this.remove_callback(callback, this.on_update);
}

AnimationLoop.prototype.add_on_stop = function(callback) {
    this.add_callback(callback, this.on_stop);
}
AnimationLoop.prototype.remove_on_stop = function(callback) {
    this.remove_callback(callback, this.on_stop);
}

AnimationLoop.prototype.start = function(start_time) { let animationLoop = this;
    if (this.requestAnimationFrameId)
        return;
    if (start_time)
        this.start_time = start_time;
    else
        this.start_time = Date.now();
    
    this.elapsed = 0;
    this.elapsed_prev = 0;
    this.dt = 0;
    
    for (let callback of this.on_start) {
        callback(this.start_time);
    }
    let update = function() {
        animationLoop.elapsed_prev = animationLoop.elapsed;
        animationLoop.elapsed = (Date.now() - animationLoop.start_time);
        animationLoop.dt = animationLoop.elapsed - animationLoop.elapsed_prev;
        for (let callback of animationLoop.on_update) {
            callback(animationLoop.elapsed, animationLoop.dt);
        }
        animationLoop.requestAnimationFrameId = window.requestAnimationFrame(update);
        //animationLoop.requestAnimationFrameId = window.setTimeout(update, 1000/60)
    }
    update();
}

AnimationLoop.prototype.stop = function() {
    if (!this.requestAnimationFrameId)
        return this.start_time;
    for (let callback of this.on_stop) {
        callback(this.elapsed);
    }
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    //window.clearTimeout(this.requestAnimationFrameId);
    this.requestAnimationFrameId = null;
    return this.start_time;
}



// implementation

AnimationLoop.prototype.add_callback = function(callback, target) {
    target.push(callback);
}
AnimationLoop.prototype.remove_callback = function(callback, target) {
    let index = target.indexOf(callback);
    if (index != -1)
        target.splice(index, 1);
}

AnimationLoop.prototype.create = function() {
    this.on_start = [];
    this.on_update = [];
    this.on_stop = [];
    
    this.start_time = null;
    this.elapsed = null;
    this.elapsed_prev = null;
    this.dt = null;
    
    this.requestAnimationFrameId = null;
}

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
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