
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

Canvas2D.prototype.draw_text_plane = function(text, x, y, view_offset_x = 0, view_offset_y = 0, format = '') { let ctx = this.context;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    if (format) {
        if (format[0] == 'r')
            ctx.textAlign = 'right';
        else if (format[0] == 'c')
            ctx.textAlign = 'center';
        if (format[1] == 't')
            ctx.textBaseline = 'top';
        else if (format[1] == 'c')
            ctx.textBaseline = 'middle';
    }

    text = (text).toString();
    //let metrics = ctx.measureText(text);
    //let text_width = (metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft);
    //let text_height = (metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent);
    
    
    let [text_x, text_y] = this.plane.to_view(x, y);
    //console.log(text_x, text_y);
    ctx.font = 'italic 9pt sans-serif';
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, text_x + view_offset_x, text_y + view_offset_y);
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
        canvas2d.draw_grid();
    });
    canvas2d.animation_loop.start();
}

let format_grid_number = function(number) {
    let text = (number).toFixed(12);
    if (text.match(/\./))
        return text.replace(/[.]*[0]+$/, '');
    return text;
}

Canvas2D.prototype.draw_grid = function() { let ctx = this.context;
    ctx.lineWidth = 1;
    for (let x of this.plane.get_vertical_grids()) {
        this.draw_line_plane(x, this.plane.get_min().y, x, this.plane.get_max().y);
        this.draw_text_plane(format_grid_number(x), x, 0, 2, 2);
    }

    for (let y of this.plane.get_horizontal_grids()) {
        this.draw_line_plane(this.plane.get_min().x, y, this.plane.get_max().x, y);
        this.draw_text_plane(format_grid_number(y), 0, y, 2, 2);
    }
    
    ctx.lineWidth = 2;
    this.draw_line_plane(0, this.plane.get_min().y, 0, this.plane.get_max().y);
    this.draw_line_plane(this.plane.get_min().x, 0, this.plane.get_max().x, 0);
}
