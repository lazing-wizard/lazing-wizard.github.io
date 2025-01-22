
// "AnimatedPlane2D" decorates Plane2D for smooth moving, and updates it when user requires depending on passed value

import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { delegate_undefined_descriptors } from '../algorithms/prototype-mods.js';

import Plane2D from './plane2d.js';
import AnimationLoop from '../animation-loop.js';

export default class AnimatedPlane2D {
    constructor(plane, ...args) { this.create(plane, ...args); };
    static instance_data_properties = 
        ['move_accumulated', 'move_deffered',
         'scale_point', 'scale_power_accumulated'];
}
create_instance_data_descriptors(AnimatedPlane2D);

AnimatedPlane2D.prototype.set_plane = function(plane) {
    if (!(plane instanceof Plane2D)) {
        throw new Error('Wrong AnimatedPlane2D plane');
    }
    this.plane = plane;
    return this;
};

AnimatedPlane2D.prototype.set_animation_loop = function(animation_loop) {
    if (this.animation_loop) {
        this.animation_loop.remove_on_update(this.update);
    }
    if (!(animation_loop instanceof AnimationLoop)) {
        throw new Error('Wrong AnimatedPlane2D animation_loop');
    }
    this.animation_loop = animation_loop;
    this.animation_loop.add_on_update_begin(this.update.bind(this));
    return this;
};
AnimatedPlane2D.prototype.detach_animation_loop = function() {
    if (this.animation_loop) {
        this.animation_loop.remove_on_update(this.update);
        this.animation_loop = null;
    }
    return this;
};

AnimatedPlane2D.prototype.init_view = function(width, height) {
    this.plane.init_view(width, height);
    
    this.move_accumulated = {x: 0, y: 0};
    this.move_deffered = {x: 0, y: 0};
    
    this.scale_point = {x: 0, y: 0};
    this.scale_power_accumulated = 0;
    
    return this;
};

AnimatedPlane2D.prototype.move_for = function(dx, dy) {
    this.move_accumulated.x += dx;
    this.move_accumulated.y += dy;

    return this;
};

AnimatedPlane2D.prototype.scale_at = function(view_x, view_y, scale) {
    this.last_scale_timestamp = Date.now();
    this.scale_point.x = view_x;
    this.scale_point.y = view_y;
    if (Math.sign(this.scale_power_accumulated) != Math.sign(scale))
        this.scale_power_accumulated = 0;
    this.scale_power_accumulated += scale;

    return this;
};

AnimatedPlane2D.prototype.scale_between = function(view_x0, view_y0, view_x1, view_y1, scale) {
    return this;
};

AnimatedPlane2D.prototype.update = function(dt, elapsed) {
    this.adjust_position(dt);
    this.adjust_scale(dt);
};



// Implementation

// https://www.desmos.com/calculator/gkniubu7ur
AnimatedPlane2D.prototype.dt_transform = function(dt, xpower, length, xmultiplier, x0) {
    return (x0 - Math.exp(-xmultiplier/length*Math.pow(dt, xpower))) / (x0 - Math.exp(-xmultiplier*Math.pow(length, xpower-1)));
};

// Maybe work with formula for acceleration
AnimatedPlane2D.prototype.adjust_position = function(dt) {
    const threshold = 0.00001;

    const momentary_move_proportion = 0.5;
    const dt_limit = 150;
    const extra_mul = 1.0;
    
    const momentary_dx = this.move_accumulated.x * momentary_move_proportion;
    const momentary_dy = this.move_accumulated.y * momentary_move_proportion;
    
    const deffered_dx = this.move_accumulated.x * (1.0 - momentary_move_proportion);
    const deffered_dy = this.move_accumulated.y * (1.0 - momentary_move_proportion);
    


    this.move_accumulated.x = 0;
    this.move_accumulated.y = 0;
    
    if (Math.abs(momentary_dx) > threshold || Math.abs(momentary_dy) > threshold)
        this.plane.move_for(momentary_dx, momentary_dy);
    else {
        this.move_accumulated.x += momentary_dx;
        this.move_accumulated.y += momentary_dy;
    }

    
    const ratio = this.dt_transform(Math.min(dt, dt_limit), 1, dt_limit, 0.06, 1);
    
    const deffered_x_current = this.move_deffered.x * ratio;
    const deffered_y_current = this.move_deffered.y * ratio;
    
    this.move_deffered.x *= 1 - ratio;
    this.move_deffered.y *= 1 - ratio;
    
    if (Math.abs(deffered_x_current) > threshold || Math.abs(deffered_y_current) > threshold)
        this.plane.move_for(deffered_x_current, deffered_y_current);
    else {
        this.move_accumulated.x += deffered_x_current;
        this.move_accumulated.y += deffered_y_current;
    }
    
    // Multiply move direction by dot product to make better path changing
    
    this.move_deffered.x += deffered_dx * extra_mul;
    this.move_deffered.y += deffered_dy * extra_mul;
};

AnimatedPlane2D.prototype.adjust_scale = function(dt) {
    const threshold = 0.00001;

    const dt_limit = 450;
    
    if (Math.abs(this.scale_power_accumulated) < threshold)
        return;

    const ratio = this.dt_transform(Math.min(dt, dt_limit), 1, dt_limit, 1, 1);
    
    this.plane.scale_at(this.scale_point.x, this.scale_point.y, this.scale_power_accumulated * 5 * ratio);

    this.scale_power_accumulated *= 1 - ratio;
};

AnimatedPlane2D.prototype.create = function(plane, animation_loop, ...args) {
    if (plane) {
        this.set_plane(plane);
        this.init_view(plane.view_size.x, plane.view_size.y);
    } else {
        this.set_plane(new Plane2D(...args));
        this.init_view(1, 1); /// init_view gets called 2 times
    }
    // Add ability to manually call update without animation loop
    if (animation_loop) {
        this.set_animation_loop(animation_loop);
    } else {
        this.set_animation_loop(new AnimationLoop());
        this.animation_loop.start();
    }
};

delegate_undefined_descriptors(AnimatedPlane2D, Plane2D, 'plane');
