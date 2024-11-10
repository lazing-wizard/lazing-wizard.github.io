
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
    // Height ratio
    let dh = new_height/this.view_size.y;
    this.scale_power += Math.log(dh)/Math.log(this.scale_base);
    this.calculate_view(new_width, new_height).calculate_scale().calculate_size().calculate_matrix();
    return this;
}
// Call when need to move plane in direction of (x, y)
// (x, y) are in view coordinate space
// When DPR differs values have to be multiplied by the ratio 
Plane2D.prototype.move_for = function(dx, dy) {
    this.center.x -= dx*this.size.x/this.view_size.x;
    this.center.y += dy*this.size.y/this.view_size.y;
    this.calculate_matrix();
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
    this.calculate_size().calculate_matrix();
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
    
    this.calculate_scale().calculate_size().calculate_matrix();
    
    return this;
}

Plane2D.prototype.update = function() {}



// Implementation

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
