
// "AnimatedPlane2D" decorates Plane2D for smooth moving, and updates it when user requires depending on passed value

function AnimatedPlane2D(plane) { this.create(plane); }

AnimatedPlane2D.prototype.set_plane = function(plane) {
    if (!(plane instanceof Plane2D)) {
        throw new Error('Wrong AnimatedPlane2D plane');
    }
    this.plane = plane;
    return this;
}

AnimatedPlane2D.prototype.init_view = function(width, height) {
    this.plane.init_view(width, height);
    
    this.move_accumulated = {x: 0, y: 0};
    this.move_deffered = {x: 0, y: 0};
    
    this.scale_point = {x: 0, y: 0};
    this.scale_power_accumulated = 0;
    
    return this;
}

AnimatedPlane2D.prototype.move_for = function(dx, dy) {
    this.move_accumulated.x += dx;
    this.move_accumulated.y += dy;
}

AnimatedPlane2D.prototype.scale_at = function(view_x, view_y, scale) {
    this.scale_point.x = view_x;
    this.scale_point.y = view_y;
    if (Math.sign(this.scale_power_accumulated) != Math.sign(scale))
        this.scale_power_accumulated = 0;
    this.scale_power_accumulated += scale;
}

AnimatedPlane2D.prototype.scale_between = function(view_x0, view_y0, view_x1, view_y1, scale) {
    
}

AnimatedPlane2D.prototype.update = function(dt) {
    this.adjust_position(dt);
    this.adjust_scale(dt);
}



// Implementation

// https://www.desmos.com/calculator/gkniubu7ur
AnimatedPlane2D.prototype.dt_transform = function(dt, xpower, length, xmultiplier, x0) {
    return (x0 - Math.exp(-xmultiplier/length*Math.pow(dt, xpower))) / (x0 - Math.exp(-xmultiplier*Math.pow(length, xpower-1)));
}

// Maybe work with formula for acceleration
AnimatedPlane2D.prototype.adjust_position = function(dt) {
    let momentary_move_proportion = 0.5;
    let dt_limit = 150;
    let extra_mul = 1.0;
    
    let momentary_dx = this.move_accumulated.x * momentary_move_proportion;
    let momentary_dy = this.move_accumulated.y * momentary_move_proportion;
    
    let deffered_dx = this.move_accumulated.x * (1.0 - momentary_move_proportion);
    let deffered_dy = this.move_accumulated.y * (1.0 - momentary_move_proportion);
    
    this.move_accumulated.x = 0;
    this.move_accumulated.y = 0;
    
    this.plane.move_for(momentary_dx, momentary_dy);
    
    let ratio = this.dt_transform(Math.min(dt, dt_limit), 1, dt_limit, 0.06, 1);
    
    let deffered_x_current = this.move_deffered.x * ratio;
    let deffered_y_current = this.move_deffered.y * ratio;
    
    this.move_deffered.x *= 1 - ratio;
    this.move_deffered.y *= 1 - ratio;
    
    this.plane.move_for(deffered_x_current, deffered_y_current);
    
    // Multiply move direction by dot product to make better path changing
    
    this.move_deffered.x += deffered_dx * extra_mul;
    this.move_deffered.y += deffered_dy * extra_mul;
}

AnimatedPlane2D.prototype.adjust_scale = function(dt) {
    let dt_limit = 450;
    
    let ratio = this.dt_transform(Math.min(dt, dt_limit), 1, dt_limit, 1, 1);
    
    this.plane.scale_at(this.scale_point.x, this.scale_point.y, this.scale_power_accumulated * 5 * ratio);
    
    this.scale_power_accumulated *= 1 - ratio;
}

AnimatedPlane2D.prototype.create = function(plane) {
    if (plane) {
        this.set_plane(plane);
    } else {
        this.plane = new Plane2D();
        this.init_view(1, 1); /// init_view gets called 2 times
    }
}

;((parent_class, child_class, delegate_name) => {
    child_methods = Object.getOwnPropertyNames(child_class.prototype)
        .filter((method) => typeof child_class.prototype[method] === 'function');
    
    parent_methods = Object.getOwnPropertyNames(parent_class.prototype)
        .filter((method) => typeof parent_class.prototype[method] === 'function');
    
    parent_methods
        .forEach(function(parent_method) {
            if (!child_methods.find((child_method) => child_method == parent_method)) {
                child_class.prototype[parent_method] = function(...args) {
                    return this[delegate_name][parent_method](...args);
                }
            }
        });
})(Plane2D, AnimatedPlane2D, 'plane');