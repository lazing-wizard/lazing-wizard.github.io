
// "Plane2D" class manages logic of tying 2D coordinate system with scaling and repositioning to view rectangle

import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';

import { vec2, vec3, mat3, Mat } from './mat.js';

export default class Plane2D {
    constructor(...args) { this.create(...args); };
    static instance_data_properties =
        ['view_size', 'view_aspect', 'center', 'scale', 'scale_base',
         'scale_power', 'span', 'span_base', 'min', 'max', 'size',
         'm_plane_to_view', 'm_view_to_plane',
         'grid_step', 'grid_scale_count',
         'minor_grid_step', 'minor_grid_scale_count',
         'vertical_axis_visible', 'horizontal_axis_visible',
         'vertical_lines', 'horizontal_lines',
         'vertical_lines_minor', 'horizontal_lines_minor',
         'vec2buf', 'vec3buf', 'array2buf', 'array3buf'];
}
create_instance_data_descriptors(Plane2D);

// Convert x,y coordinates from plane to view
Plane2D.prototype.to_view = Plane2D.prototype.from_plane = Plane2D.prototype.plane_to_view = function() {
    return this.translate(this.m_plane_to_view, ...arguments);
};
// Convert x,y coordinates from view to plane
Plane2D.prototype.to_plane = Plane2D.prototype.from_view = Plane2D.prototype.view_to_plane = function() {
    return this.translate(this.m_view_to_plane, ...arguments);
};

// Call when view size changed
Plane2D.prototype.resize_view = function(new_width, new_height) {
    new_width = new_width >= 1 ? new_width : 1;
    new_height = new_height >= 1 ? new_height : 1;
    this.scale_power += Math.log(new_height/this.view_size.y)/Math.log(this.scale_base);
    this.calculate_view(new_width, new_height).calculate_scale().calculate_size().calculate_matrix().calculate_grid();
    return this;
};
// Call when need to move plane in direction of (x, y)
// (x, y) are in view coordinate space
// When DPR differs values have to be multiplied by the ratio
Plane2D.prototype.move_for = function(dx, dy) {
    this.center.x -= dx*this.size.x/this.view_size.x;
    this.center.y += dy*this.size.y/this.view_size.y;
    this.calculate_size().calculate_matrix().calculate_grid();
    return this;
};
// Call when need to scale at point, scale is the amount added to scale_power
// (x, y) are in view coordinate space
Plane2D.prototype.scale_at = function(view_x, view_y, scale) {
    const [x0, y0] = this.to_plane(view_x, view_y);
    this.scale_power += scale;
    this.calculate_scale().calculate_size().calculate_matrix();
    const [x1, y1] = this.to_plane(view_x, view_y);
    this.center.x += x0 - x1;
    this.center.y += y0 - y1;
    this.calculate_size().calculate_matrix().calculate_grid();
    return this;
};

// Initialize fresh plane for certain width and height
Plane2D.prototype.init_view = function(width, height) {
    if (width <= 0 || height <= 0 ) {
        throw new Error('Plane view size less than or equal to 0');
    }
    
    this.calculate_view(width, height);
    
    this.center.x = 0.0;
    this.center.y = 0.0;
    
    this.scale_base = 1.06778997;
    this.scale_power = 0;
    
    this.calculate_scale().calculate_size().calculate_matrix().calculate_grid();
    
    return this;
};



// Implementation

// Values in this function exist only to declare variables
Plane2D.prototype.create = function(width, height) {
    // Size of the screen plane is plotted on
    this.view_size = vec2(1.0, 1.0);
    
    // Ratio of view width to view height
    this.view_aspect = 1;
    
    // Central point of current location on plane
    this.center = vec2(0.0, 0.0);
    
    // Multiplier of span calculated as power of scale_base to scale_power
    this.scale = 1.0;
    this.scale_base = 1.06778997;
    this.scale_power = 0;
    
    // Distance from center to two edges
    this.span = vec2(0.0, 0.0);
    this.span_base = vec2(0.0, 0.0);
    
    // Both lines edge points coordinates
    this.min = vec2(0.0, 0.0);
    this.max = vec2(0.0, 0.0);
    
    // Size of plane in plot coordinates
    this.size = vec2(0.0, 0.0);
    
    // Homogeneous transforms between view and plane
    this.m_plane_to_view = mat3();
    this.m_view_to_plane = mat3();
    
    this.vertical_axis_visible = false;
    this.horizontal_axis_visible = false;

    this.grid_step = 1;
    this.grid_scale_count = 1;
    this.vertical_lines = [];
    this.horizontal_lines = [];
    this.minor_grid_step = 1;
    this.minor_grid_scale_count = 1;
    this.vertical_lines_minor = [];
    this.horizontal_lines_minor = [];

    this.vec2buf = vec2();
    this.vec3buf = vec3();
    this.array2buf = new Array(2);
    this.array3buf = new Array(3);

    if (width && height)
        this.init_view(width, height);
    else
        this.init_view(1, 1);
};

Plane2D.prototype.calculate_view = function(width, height) {
    this.view_size.x = width;
    this.view_size.y = height;
    this.view_aspect = width/height;
    return this;
};

Plane2D.prototype.calculate_scale = function() {
    this.scale = Math.pow(this.scale_base, this.scale_power);
    return this;
};

Plane2D.prototype.calculate_size = function() {
    this.span_base.x = 5.0 * this.view_aspect;
    this.span_base.y = 5.0;
    this.span.x = this.span_base.x * this.scale;
    this.span.y = this.span_base.y * this.scale;
    
    this.min.x = this.center.x - this.span.x;
    this.min.y = this.center.y - this.span.y;
    this.max.x = this.center.x + this.span.x;
    this.max.y = this.center.y + this.span.y;

    this.size.x = this.span.x*2.0;
    this.size.y = this.span.y*2.0;
    
    return this;
};

Plane2D.prototype.calculate_matrix = function() {
    this.m_plane_to_view.assign(this.view_size.x/this.size.x, 0,                             this.view_size.x/2 - this.center.x*this.view_size.x/this.size.x,
                                0,                            -this.view_size.y/this.size.y, this.view_size.y/2 + this.center.y*this.view_size.y/this.size.y,
                                0,                            0,                             1);
    this.m_view_to_plane.assign(this.size.x/this.view_size.x, 0,                             -this.size.x/2 + this.center.x,
                                0,                            -this.size.y/this.view_size.y, this.size.y/2 + this.center.y,
                                0,                            0,                             1);
    return this;
};

// sign(x)*mod(abs(x), d) on desmos
//function signed_mod(x, d) {
//    return x % d;
//}

function positive_mod(x, d) {
    return ((x%d)+d)%d;
}

function get_grid_step(n) {
    // Calculates grid step as 0.1, 0.25, 0.5, 1, 2, 4, 10, 20, 40, 100...
    // 0.1 0.2 0.25 0.5 1 2 4 5 10 20 40 50 100 200 400 500 1000 2000 4000
    //                  0 1 2 3 4  5  6  7  8   9   10  11  12   13   14

    //let two_power = Math.sign(n)*( Math.floor( Math.floor((Math.abs(n) + 0.5) % 4) % 3) + Math.floor((Math.abs(n) + 0.5)/4) );
    //let five_power = Math.sign(n)*Math.floor((Math.abs(n) + 1.5)/4);

    //https://www.desmos.com/calculator/vqhk6xb50e
    // Calculates grid step as 0.1, 0.2, 0.5, 1, 2, 10, 20, 50...
    //   -9    -8 |   -7    -6    -5  |  -4    -3    -2  |  -1     0     1  |   2     3     4  |   5     6     7  |   8     9    10 |   11    12    13
    //0.001 0.002 |0.005  0.01  0.02  |0.05   0.1   0.2  | 0.5     1     2  |   5    10    20  |  50   100   200  | 500  1000  2000 | 5000 10000 20000
//2^     -3    -2 |   -3    -2    -1  |  -2    -1     0  |  -1     0     1  |   0     1     2  |   1     2     3  |   2     3     4 |    3     4     5  
//5^     -3    -3 |   -2    -2    -2  |  -1    -1    -1  |   0     0     0  |   1     1     1  |   2     2     2  |   3     3     3 |    4     4     4

    const two_power = Math.round(n/3) + Math.round(positive_mod(n - 1.5, 3) - 1.5);
    const five_power = Math.round(n/3);

    return Math.pow(2.0, two_power)*Math.pow(5.0, five_power);
};
Plane2D.prototype.calculate_grid = function() {
    const grid_count_vertical = this.view_size.y / 40;
    const grid_count_horizontal = this.view_size.x / 80;

    const frac_step = Math.max(this.size.x/grid_count_horizontal, this.size.y/grid_count_vertical, this.size.x/20, this.size.y/20);

    while (this.grid_step < frac_step) {
        this.grid_scale_count += 1;
        this.grid_step = get_grid_step(this.grid_scale_count);
    }
    while (true) {
        const grid_scale_count = this.grid_scale_count - 1;
        const grid_step = get_grid_step(grid_scale_count);
        if (grid_step < frac_step) {
            const lesser_diff = frac_step - grid_step;
            const bigger_diff = this.grid_step - frac_step;
            if (bigger_diff > lesser_diff) {
                this.grid_scale_count = grid_scale_count;
                this.grid_step = grid_step;
            }
            break;
        }
        this.grid_scale_count = grid_scale_count;
        this.grid_step = grid_step;
    }
    this.minor_grid_scale_count = this.grid_scale_count - 2;
    this.minor_grid_step = get_grid_step(this.minor_grid_scale_count);

    const grid_center_x = Math.trunc(this.center.x/this.grid_step)*this.grid_step;
    const grid_center_y = Math.trunc(this.center.y/this.grid_step)*this.grid_step;

    const calculate_values = function(target, center, step, min, max) {
        target.length = 0;
        let shift;
        shift = center + step;
        while (shift < max + step) {
            target.push(shift);
            shift += step;
        }
        target.push(center);
        shift = center - step;
        while (shift > min - step) {
            target.push(shift);
            shift -= step;
        }
    };
    
    /// Make lines number consistent for better passing on gpu without reallocation, currently it changes fast when moving plane
    /// It's possibly better to calculate lines number as ceil of (max-min)/grid_step+2 and start from the invisible ones (for showing numbers)

    /// Don't include usual lines in minor lines array

    // Vertical lines
    this.vertical_axis_visible = this.min.x <= 0 && this.max.x >= 0;
    calculate_values(this.vertical_lines, grid_center_x, this.grid_step, this.min.x, this.max.x);
    calculate_values(this.vertical_lines_minor, grid_center_x, this.minor_grid_step, this.min.x, this.max.x);
    // Horizontal lines
    this.horizontal_axis_visible = this.min.y <= 0 && this.max.y >= 0;
    calculate_values(this.horizontal_lines, grid_center_y, this.grid_step, this.min.y, this.max.y);
    calculate_values(this.horizontal_lines_minor, grid_center_y, this.minor_grid_step, this.min.y, this.max.y);
    
    return this;
};

// Convert homogeneous coordinates with matrix
Plane2D.prototype.translate = function(m) {
    if (arguments.length == 2) {
        const v = arguments[1];
        if (v instanceof Array) {
            if (v.length == 2) {
                this.vec3buf.assign(v[0], v[1], 1).mul_inplace(m);
                this.array2buf[0] = this.vec3buf.x;
                this.array2buf[1] = this.vec3buf.y;
                return this.array2buf;
            } else if (v.length == 3) {
                this.vec3buf.assign(v[0], v[1], v[2]).mul_inplace(m);
                this.array3buf[0] = this.vec3buf.x;
                this.array3buf[1] = this.vec3buf.y;
                this.array3buf[2] = this.vec3buf.z;
                return this.array3buf;
            }
        } else if (v instanceof Mat) {
            if (v.dim == 2) {
                this.vec3buf.assign(v.x, v.y, 1).mul_inplace(m);
                return this.vec2buf.assign(this.vec3buf.x, this.vec3buf.y);
            } else if (v.dim == 3) {
                return v.mul(m, this.vec3buf);
            }
        }
        throw new Error('Wrong vector translation');
    } else if (arguments.length == 3) {
        this.vec3buf.assign(arguments[1], arguments[2], 1).mul_inplace(m);
        this.array2buf[0] = this.vec3buf.x;
        this.array2buf[1] = this.vec3buf.y;
        return this.array2buf;
    } else if (arguments.length == 4) {
        this.vec3buf.assign(arguments[1], arguments[2], arguments[3]).mul_inplace(m);
        this.array3buf[0] = this.vec3buf.x;
        this.array3buf[1] = this.vec3buf.y;
        this.array3buf[2] = this.vec3buf.z;
        return this.array3buf;
    }
    throw new Error('Wrong vector translation');
};
