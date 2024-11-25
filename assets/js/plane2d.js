
// "Plane2D" class manages logic of tying 2D coordinate system with scaling and repositioning to view rectangle

function Plane2D() { this.create(); }

// Convert x,y coordinates from plane to view
Plane2D.prototype.to_view = Plane2D.prototype.from_plane = Plane2D.prototype.plane_to_view = function(...args) {
    return this.translate(this.m_plane_to_view, ...args);
}
// Convert x,y coordinates from view to plane
Plane2D.prototype.to_plane = Plane2D.prototype.from_view = Plane2D.prototype.view_to_plane = function(...args) {
    return this.translate(this.m_view_to_plane, ...args);
}

// Call when view size changed
Plane2D.prototype.resize_view = function(new_width, new_height) {
    new_width = new_width >= 1 ? new_width : 1;
    new_height = new_height >= 1 ? new_height : 1;
    this.scale_power += Math.log(new_height/this.view_size.y)/Math.log(this.scale_base);
    this.calculate_view(new_width, new_height).calculate_scale().calculate_size().calculate_matrix().calculate_grid();
    return this;
}
// Call when need to move plane in direction of (x, y)
// (x, y) are in view coordinate space
// When DPR differs values have to be multiplied by the ratio 
Plane2D.prototype.move_for = function(dx, dy) {
    this.center.x -= dx*this.size.x/this.view_size.x;
    this.center.y += dy*this.size.y/this.view_size.y;
    this.calculate_size().calculate_matrix().calculate_grid();
    return this;
}
// Call when need to scale at point, scale is the amount added to scale_power
// (x, y) are in view coordinate space
Plane2D.prototype.scale_at = function(view_x, view_y, scale) {
    let [x0, y0] = this.to_plane(view_x, view_y);
    this.scale_power += scale;
    this.calculate_scale().calculate_size().calculate_matrix();
    let [x1, y1] = this.to_plane(view_x, view_y);
    this.center.x += x0 - x1;
    this.center.y += y0 - y1;
    this.calculate_size().calculate_matrix().calculate_grid();
    return this;
}
/// fix problem when moving after scale
Plane2D.prototype.scale_between = function(view_x0, view_y0, view_x1, view_y1, scale) {
    ///
}

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
}

Plane2D.prototype.update = function() {}



// Implementation

Plane2D.data_members = ['view_size', 'view_aspect', 'center', 'scale', 'scale_base',
                        'scale_power', 'span', 'span_base', 'min', 'max', 'size',
                        'm_plane_to_view', 'm_view_to_plane',
                        'grid_step', 'vertical_grids', 'horizontal_grids', 'grid_scale_count'];
// Values in this function exist only to declare variables
Plane2D.prototype.create = function() {
    // Size of the screen plane is plotted on
    this.view_size = {x: 1, y: 1};
    
    // Ratio of view width to view height
    this.view_aspect = 1;
    
    // Central point of current location on plane
    this.center = {x: 0.0, y: 0.0};
    
    // Multiplier of span calculated as power of scale_base to scale_power
    this.scale = 1.0;
    this.scale_base = 1.06778997;
    this.scale_power = 0;
    
    // Distance from center to two edges
    this.span = {x: 0.0, y: 0.0};
    this.span_base = {x: 0.0, y: 0.0};
    
    // Both lines edge points coordinates
    this.min = {x: 0.0, y: 0.0};
    this.max = {x: 0.0, y: 0.0};
    
    // Size of plane in plot coordinates
    this.size = {x: 0.0, y: 0.0};
    
    // Homogeneous transforms between view and plane
    this.m_plane_to_view = 0;
    this.m_view_to_plane = 0;
    
    this.grid_step = 1;
    this.grid_scale_count = 1;
    this.vertical_grids = [];
    this.horizontal_grids = [];

    this.init_view(1, 1);
}

Plane2D.prototype.calculate_view = function(width, height) {
    this.view_size.x = width;
    this.view_size.y = height;
    this.view_aspect = width/height;
    return this;
}

Plane2D.prototype.calculate_scale = function() {
    this.scale = Math.pow(this.scale_base, this.scale_power);
    return this;
}

Plane2D.prototype.calculate_size = function () {
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
}

Plane2D.prototype.calculate_matrix = function() {
    this.m_plane_to_view = mat3(this.view_size.x/this.size.x, 0,                             this.view_size.x/2 - this.center.x*this.view_size.x/this.size.x,
                                0,                            -this.view_size.y/this.size.y, this.view_size.y/2 + this.center.y*this.view_size.y/this.size.y,
                                0,                            0,                             1);
    this.m_view_to_plane = mat3(this.size.x/this.view_size.x, 0,                             -this.size.x/2 + this.center.x,
                                0,                            -this.size.y/this.view_size.y, this.size.y/2 + this.center.y,
                                0,                            0,                             1);
    return this;
}

// sign(x)*mod(abs(x), d) on desmos
let signed_mod = function(x, d) {
    return x % d;
}
let positive_mod = function(x, d) {
    return ((x%d)+d)%d;
}

let get_grid_step = function(n) {
    // Calculates grid step as 0.1, 0.25, 0.5, 1, 2, 4, 10, 20, 40, 100...
    // 0.1 0.2 0.25 0.5 1 2 4 5 10 20 40 50 100 200 400 500 1000 2000 4000
    //                  0 1 2 3 4  5  6  7  8   9   10  11  12   13   14

    //let two_power = Math.sign(n)*( Math.floor( Math.floor((Math.abs(n) + 0.5) % 4) % 3) + Math.floor((Math.abs(n) + 0.5)/4) );
    //let five_power = Math.sign(n)*Math.floor((Math.abs(n) + 1.5)/4);

    //https://www.desmos.com/calculator/vqhk6xb50e
    // Calculates grid step as 0.1, 0.2, 0.5, 1, 2, 10, 20, 50...
    //   -9    -8 |   -7    -6    -5  |  -4    -3    -2  |  -1     0     1  |   2     3     4  |   5     6     7  |   8     9    10 |   11    12    13 |   14
    //0.001 0.002 |0.005  0.01  0.02  |0.05   0.1   0.2  | 0.5     1     2  |   5    10    20  |  50   100   200  | 500  1000  2000 | 5000 10000 20000 |50000
//2^     -3    -2 |   -3    -2    -1  |  -2    -1     0  |  -1     0     1  |   0     1     2  |   1     2     3  |   2     3     4 |    3     4     5 |    4     
//5^     -3    -3 |   -2    -2    -2  |  -1    -1    -1  |   0     0     0  |   1     1     1  |   2     2     2  |   3     3     3 |    4     4     4 |    5

    let two_power = Math.round(n/3) + Math.round(positive_mod(n - 1.5, 3) - 1.5);
    let five_power = Math.round(n/3);

    return Math.pow(2.0, two_power)*Math.pow(5.0, five_power);
}
Plane2D.prototype.calculate_grid = function() {
    let grid_count_vertical = this.view_size.y / 90;
    let grid_count_horizontal = this.view_size.x / 180;

    let frac_step = Math.max(this.size.x/grid_count_horizontal, this.size.y/grid_count_vertical, this.size.x/20, this.size.y/20);

    while (this.grid_step < frac_step) {
        this.grid_scale_count += 1;
        this.grid_step = get_grid_step(this.grid_scale_count);
    }
    while (true) {
        let grid_scale_count = this.grid_scale_count - 1;
        let grid_step = get_grid_step(grid_scale_count);
        if (grid_step < frac_step) {
            let lesser_diff = frac_step - grid_step;
            let bigger_diff = this.grid_step - frac_step;
            if (bigger_diff > lesser_diff) {
                this.grid_scale_count = grid_scale_count;
                this.grid_step = grid_step;
            }
            break;
        }
        this.grid_scale_count = grid_scale_count;
        this.grid_step = grid_step;
    }

    let grid_center_x = Math.trunc(this.center.x/this.grid_step)*this.grid_step;
    let grid_center_y = Math.trunc(this.center.y/this.grid_step)*this.grid_step;

    // Horizontal lines
    this.horizontal_grids.length = 0;
    let shift;
    shift = grid_center_y + this.grid_step;
    while (shift < this.center.y + this.span.y) {
        this.horizontal_grids.push(shift);
        shift += this.grid_step;
    }
    this.horizontal_grids.push(grid_center_y);
    shift = grid_center_y - this.grid_step;
    while (shift > this.center.y - this.span.y) {
        this.horizontal_grids.push(shift);
        shift -= this.grid_step;
    }
    
    // Vertical lines
    this.vertical_grids.length = 0;
    shift = grid_center_x + this.grid_step;
    while (shift < this.center.x + this.span.x) {
        this.vertical_grids.push(shift);
        shift += this.grid_step;
    }
    this.vertical_grids.push(grid_center_x);
    shift = grid_center_x - this.grid_step;
    while (shift > this.center.x - this.span.x) {
        this.vertical_grids.push(shift);
        shift -= this.grid_step;
    }

    return this;
}

// Convert homogeneous coordinates with matrix
Plane2D.prototype.translate = function(m, ...args) {
    if (args.length == 1) {
        if (args[0] instanceof Array) {
            if (args[0].length == 2) {
                let out = vec3(args[0][0], args[0][1], 1).mul(m);
                return [out.x(), out.y()];
            } else if (args[0].length == 3) {
                let out = vec3(args[0][0], args[0][1], args[0][2]).mul(m);
                return [out.x(), out.y(), out.z()];
            }
            throw new Error('Wrong vector translation');
        } else if (args[0] instanceof Mat) {
            if (args[0].vdim() == 2) {
                let out = vec3(args[0].x(), args[0].y(), 1).mul(m);
                return vec2(out.x(), out.y());
            } else if (args[0].vdim() == 3) {
                let out = args[0].mul(m);
                return out;
            }
            throw new Error('Wrong vector translation');
        }
    } else if (args.length == 2) {
        let out = vec3(args[0], args[1], 1).mul(m);
        return [out.x(), out.y()];
    } else if (args.length == 3) {
        let out = vec3(args[0], args[1], args[2]).mul(m);
        return [out.x(), out.y(), out.z()];
    }
     throw new Error('Wrong vector translation');
}

// Getters and setters (for plane they need to address decorated plane members without plane.plane.)
generate_accessors(Plane2D);
