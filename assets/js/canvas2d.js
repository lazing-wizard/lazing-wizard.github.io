
//

function Canvas2D(...args) { this.create(...args); }

Canvas2D.prototype.set_canvas = function(canvas) {
    return this;
}
Canvas2D.prototype.set_draw_mode = function(mode) {
    return this;
}
Canvas2D.prototype.set_pixel_ratio = function(pixel_ratio) {
    return this;
}

Canvas2D.prototype.draw_point = function(x, y, mode) {
    return this;
}
Canvas2D.prototype.draw_point_screen = function(x, y) {
    
    return this;
}
Canvas2D.prototype.draw_point_plane = function(x, y) {
    
    return this;
}
Canvas2D.prototype.draw_points = function(x, y, mode) {
    return this;
}
Canvas2D.prototype.draw_points_screen = function(x, y) {
    return this;
}
Canvas2D.prototype.draw_points_plane = function(x, y) {
    return this;
}

Canvas2D.prototype.draw_line = function(x0, y0, x1, y1, mode) { let ctx = this.context;
    return this;
}
Canvas2D.prototype.draw_line_screen = function(x, y) {
    return this;
}
Canvas2D.prototype.draw_line_plane = function(x0, y0, x1, y1) { let ctx = this.context;
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    [x0, y0] = this.plane.to_view(x0, y0);
    [x1, y1] = this.plane.to_view(x1, y1);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    return this;
}
Canvas2D.prototype.draw_lines = function(x, y, mode) {
    return this;
}
Canvas2D.prototype.draw_lines_screen = function(x, y) {
    
    return this;
}
Canvas2D.prototype.draw_lines_plane = function(x, y) {
    return this;
}

Canvas2D.prototype.draw_text_plane = function(x, y, text, f) { let ctx = this.context;
    text = (text).toString();
    let metrics = ctx.measureText(text);
    let text_width = (metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft);
    let text_height = (metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent);
    
    
    let [text_x, text_y] = this.plane.to_view(x, y);
    //console.log(text_x, text_y);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = 'italic ' + Math.round(9*this.pixel_ratio) + 'pt sans-serif';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, text_x, text_y);
}


Canvas2D.prototype.draw_plane_grid = function(grid_count) {
    
}

Canvas2D.prototype.add_draw = function(callback) {
    this.draw_callbacks.push(callback);
}

// Implementation

Canvas2D.prototype.create = function(...args) {
    this.canvas = null;
    this.mouse_pressed = false;
    this.pixel_ratio = 1;
    this.draw_mode = 'p';
    this.event_delegate = {};
    this.draw_callbacks = [];
    for (let arg of args) {
        if (arg instanceof HTMLCanvasElement) {
            this.canvas = arg;
            this.context = this.canvas.getContext('2d');
        } else if (arg instanceof ElementObserver) {
            this.element_observer = arg;
        } else if (arg instanceof AnimationLoop) {
            this.animation_loop = arg;
        } else if (arg instanceof Plane2D || arg instanceof AnimatedPlane2D) {
            this.plane = arg;
        }
    }
    if (!this.element_observer) {
        this.element_observer = new ElementObserver();
    }
    if (!this.animation_loop) {
        this.animation_loop = new AnimationLoop();
    }
    if (!this.plane) {
        this.plane = new AnimatedPlane2D();
        this.plane.init_view(this.canvas.clientWidth * this.pixel_ratio, this.canvas.clientHeight * this.pixel_ratio);
    }
    if (this.canvas) {
        this.attach_canvas();
    }
}

Canvas2D.prototype.attach_canvas = function() { let canvas2d = this;
    canvas2d.event_delegate.eventmousedown = function(event, event_prev, event_diff) {
        canvas2d.mouse_pressed = true;
    }
    canvas2d.event_delegate.eventmouseup = function(event) {
        canvas2d.mouse_pressed = false;
    }
    canvas2d.event_delegate.eventmousemove = function(event) {
        if (canvas2d.mouse_pressed) {
            canvas2d.plane.move_for(event.movementX * canvas2d.pixel_ratio, event.movementY * canvas2d.pixel_ratio);
        }
    }
    canvas2d.event_delegate.eventresize = function(event, event_prev, event_diff) {
        canvas2d.plane.resize_view(event.clientWidth, event.clientHeight);
    }
    canvas2d.event_delegate.eventwheel = function(event) {
        canvas2d.plane.scale_at(event.offsetX * canvas2d.pixel_ratio, event.offsetY * canvas2d.pixel_ratio, Math.sign(event.deltaY));
    }
    
    canvas2d.element_observer.observe(canvas2d.canvas, canvas2d.event_delegate);
    
    canvas2d.animation_loop.add_on_update(function(elapsed, dt) {
        if (canvas2d.canvas.width != canvas2d.canvas.clientWidth * canvas2d.pixel_ratio || canvas2d.canvas.height != canvas2d.canvas.clientHeight * canvas2d.pixel_ratio) {
            canvas2d.canvas.width = canvas2d.canvas.clientWidth * canvas2d.pixel_ratio;
            canvas2d.canvas.height = canvas2d.canvas.clientHeight * canvas2d.pixel_ratio;
        }
        canvas2d.plane.update(dt);
        canvas2d.context.clearRect(0, 0, canvas2d.canvas.width, canvas2d.canvas.height);
        for (callback of canvas2d.draw_callbacks) {
            callback(elapsed, dt);
        }
        canvas2d.calculate_grid();
    });
    canvas2d.animation_loop.start();
}

Canvas2D.prototype.get_grid_step = function() {
    let getGridStep = function getGridStep(n) {
        // Calculates grid step as 0.1, 0.25, 0.5, 1, 2, 4, 10, 20, 40, 100...
        //let two_power = Math.sign(n)*Math.ceil(Math.abs(n)*2/3);
        //let twoh_power = Math.trunc(n/3);
        //return Math.pow(2.0, two_power)*Math.pow(2.5, twoh_power);
        
        // 0.1 0.2 0.25 0.5 1 2 4 5 10 20 40 50 100 200 400 500 1000 2000 4000
        //                  0 1 2 3 4  5  6  7  8   9   10  11  12   13   14
        let two_power = Math.sign(n)*( Math.floor( Math.floor((Math.abs(n) + 0.5) % 4) % 3) + Math.floor((Math.abs(n) + 0.5)/4) );
        let five_power = Math.sign(n)*Math.floor((Math.abs(n) + 1.5)/4);
        return Math.pow(2.0, two_power)*Math.pow(5.0, five_power);
    }
    let grid_count = 10;
    
    let frac_step = Math.max(this.plane.plane.size.x/grid_count, this.plane.plane.size.y/grid_count);
    
    this.grid_step = 1;
    this.grid_scale_count = 1;
    
    while (this.grid_step < frac_step) {
        this.grid_scale_count += 1;
        this.grid_step = getGridStep(this.grid_scale_count);
    }
    
    while (true) {
        let grid_scale_count = this.grid_scale_count - 1;
        let grid_step = getGridStep(grid_scale_count);
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
    
    //https://www.desmos.com/calculator/9ophh2oj8v
    
}

Canvas2D.prototype.calculate_grid = function() {
    
    this.get_grid_step();
    
    this.grid_center = {};
    
    this.grid_center.x = Math.trunc(this.plane.plane.center.x/this.grid_step)*this.grid_step;
    this.grid_center.y = Math.trunc(this.plane.plane.center.y/this.grid_step)*this.grid_step;
    
    let ctx = this.context;
    
    ctx.lineWidth = Math.round(1*this.pixelRatio);
    
    
    let to = this;
    
    // Horizontal lines
    let draw_horizontal = function(shift) {
        to.draw_line_plane(to.plane.plane.min.x, shift, to.plane.plane.max.x, shift);
        //let text = format_grid_number(shift);
        //let metrics = ctx.measureText(text);
        //let text_width = (metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft)/graph.canvas_size.w*graph.plane_size.w;
        //let text_x = Math.min(Math.max(0.0 + wm, graph.min.x), graph.max.x - text_width);
        //graph.drawtext(text, text_x, shift - hm);
    }
    let shift;
    shift = this.grid_center.y;
    draw_horizontal(shift);
    shift = this.grid_center.y + this.grid_step;
    while (shift < this.plane.plane.center.y + this.plane.plane.span.y) {
        draw_horizontal(shift);
        shift += this.grid_step;
    }
    shift = this.grid_center.y - this.grid_step;
    while (shift > this.plane.plane.center.y - this.plane.plane.span.y) {
        draw_horizontal(shift);
        shift -= this.grid_step;
    }
    
    // Vertical lines
    let draw_vertical = function(shift) {
        to.draw_line_plane(shift, to.plane.plane.min.y, shift, to.plane.plane.max.y);
        //let text = format_grid_number(shift);
        //let metrics = ctx.measureText(text);
        //let text_height = (metrics.actualBoundingBoxDescent)/graph.canvas_size.w*graph.plane_size.w;
        //let text_y = Math.min(Math.max(0.0 - hm, graph.min.y + text_height), graph.max.y);
        //graph.drawtext(text, shift + wm, text_y);
    }
    shift = this.grid_center.x;
    draw_vertical(shift);
    shift = this.grid_center.x + this.grid_step;
    while (shift < this.plane.plane.center.x + this.plane.plane.span.x) {
        draw_vertical(shift);
        shift += this.grid_step;
    }
    shift = this.grid_center.x - this.grid_step;
    while (shift > this.plane.plane.center.x - this.plane.plane.span.x) {
        draw_vertical(shift);
        shift -= this.grid_step;
    }
    
    // Main axes
    
    //console.log(this.plane.plane.min.y, this.plane.plane.max.y);
    //console.log(this.plane.plane.min.x, this.plane.plane.max.x);
    //console.log(this.plane.plane.center.x, this.plane.plane.center.y);
    ctx.lineWidth = Math.round(2*this.pixelRatio);
    this.draw_line_plane(0, this.plane.plane.min.y, 0, this.plane.plane.max.y);
    this.draw_line_plane(this.plane.plane.min.x, 0, this.plane.plane.max.x, 0);
    this.draw_text_plane(0, 0, 0);
}


// step/(2^n * 5^m) - 1    find such n and m to converge it to zero
// step/(2^n * 5^m) = 1
// log(step) - nlog2 - mlog5 = 0