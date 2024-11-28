
//

function Canvas2D(...args) { this.create(...args); }

Canvas2D.prototype.set_canvas = function(canvas) {
    return this;
}

Canvas2D.prototype.set_pixel_ratio = function(pixel_ratio) {
    return this;
}

Canvas2D.prototype.draw_point = function(x, y, format, base_format) {
    let ctx = this.context;
    if (!base_format) base_format = this.point_format;
    if (!format) format = base_format;

    ctx.fillStyle = priority_chose(format, 'color', base_format, 'color');
    let thickness = priority_chose(format, 'thickness', base_format, 'thickness');

    x -= thickness/2;
    y -= thickness/2;
    ctx.fillRect(x, y, thickness, thickness);
    
    return this;
}

Canvas2D.prototype.draw_point_plane = function(x, y, format, base_format) {
    [x, y] = this.plane.to_view(x, y);
    return this.draw_point(x, y, format, base_format);
}


Canvas2D.prototype.draw_line = function(x0, y0, x1, y1, format, base_format) {
    let ctx = this.context;
    if (!base_format) base_format = this.line_format;
    if (!format) format = base_format;

    ctx.strokeStyle = priority_chose(format, 'color', base_format, 'color');
    ctx.lineWidth = priority_chose(format, 'thickness', base_format, 'thickness');

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    return this;
}
Canvas2D.prototype.draw_line_plane = function(x0, y0, x1, y1, format, base_format) {
    [x0, y0] = this.plane.to_view(x0, y0);
    [x1, y1] = this.plane.to_view(x1, y1);
    return this.draw_line(x0, y0, x1, y1, format, base_format);
}

let priority_chose = function() {
    for (let i = 0; i < arguments.length; i+=2) {
        const object = arguments[i];
        const key = arguments[i+1];
        if (key in object) {
            return object[key];
        }
    }
}

// Baseline: top, hanging, middle, alphabetic, ideographic, bottom
// Align: left, center, right, start, end
Canvas2D.prototype.draw_text = function(text, x, y, format, base_format) {
    let ctx = this.context;
    if (!base_format) base_format = this.text_format;
    if (!format) format = base_format;

    ctx.font = priority_chose(format, 'font', base_format, 'font');
    ctx.textBaseline = priority_chose(format, 'baseline', base_format, 'baseline');
    ctx.textAlign = priority_chose(format, 'align', base_format, 'align');
    let offset = priority_chose(format, 'offset', base_format, 'offset');
    // If text is in visible area but goes beyond screen edges it will fit
    let fit_vertical = priority_chose(format, 'fit_vertical', format, 'fit', base_format,
        'fit_vertical', base_format, 'fit');
    let fit_horizontal = priority_chose(format, 'fit_horizontal', format, 'fit', base_format,
        'fit_horizontal', base_format, 'fit');
    let bound_vertical = priority_chose(format, 'bound_vertical', format, 'bound', base_format,
        'bound_vertical', base_format, 'bound');
    let bound_horizontal = priority_chose(format, 'bound_horizontal', format, 'bound', base_format,
        'bound_horizontal', base_format, 'bound');
    let indent = priority_chose(format, 'indent', base_format, 'indent');
    let background_color = priority_chose(format, 'background_color', base_format, 'background_color');
    let background_indent = priority_chose(format, 'background_indent', base_format, 'background_indent');

    if (!(typeof text === 'string'))
        text = (text).toString();
    
    let fit_position = function(fit, bound, pos, offset, indent, box_left, box_right, border_pos_left, border_pos_right) {
        if (fit || bound) {
            const left_border = border_pos_left + indent;
            const right_border = border_pos_right - indent;
            
            const visible_box_left = Math.min(offset - box_left, 0);
            const visible_pos_left = pos + visible_box_left;

            const visible_box_right = Math.max(offset + box_right, 0);
            const visible_pos_right = pos + visible_box_right;

            let should_be_visible = bound || (visible_pos_right >= border_pos_left && visible_pos_left <= border_pos_right);
            if (should_be_visible) {
                pos = clamp(pos + offset, left_border + box_left, right_border - box_right);
            }
            return pos;
        }
    }

    let metrics;
    let box_left;
    let box_right;
    let box_top;
    let box_bottom;
    
    if (fit_horizontal || fit_vertical || bound_horizontal || bound_vertical || background_color != 'none') {
        metrics = ctx.measureText(text);
        box_left = metrics.actualBoundingBoxLeft;
        box_right = metrics.actualBoundingBoxRight;
        box_top = metrics.actualBoundingBoxAscent;
        box_bottom = metrics.actualBoundingBoxDescent;
    }

    if (fit_horizontal || bound_horizontal) {
        x = fit_position(fit_horizontal, bound_horizontal, x, offset.x, indent.x, box_left, box_right, 0, this.plane.view_size.x);
    } else {
        x += offset.x;
    }

    if (fit_vertical || bound_vertical) {
        y = fit_position(fit_vertical, bound_vertical, y, offset.y, indent.y, box_top, box_bottom, 0, this.plane.view_size.y);
    } else {
        y += offset.y;
    }
    
    if (background_color == 'transparent') {
        ctx.clearRect(x - box_left - background_indent.x,
                      y - box_top - background_indent.y,
                      box_left + box_right + background_indent.x * 2,
                      box_top + box_bottom + background_indent.y * 2);
    } else if (background_color != 'none') {
        ctx.fillStyle = background_color;
        ctx.fillRect(x - box_left - background_indent.x,
                     y - box_top - background_indent.y,
                     box_left + box_right + background_indent.x * 2,
                     box_top + box_bottom + background_indent.y * 2);
    }
    
    ctx.fillStyle = priority_chose(format, 'color', base_format, 'color');
    ctx.fillText(text, x, y);
    return this;
}

Canvas2D.prototype.draw_text_plane = function(text, x, y, format, base_format) {
    [x, y] = this.plane.to_view(x, y);
    return this.draw_text(text, x, y, format, base_format);
}

Canvas2D.prototype.add_draw = function(callback) {
    this.draw_callbacks.push(callback);
}



// Implementation

Canvas2D.prototype.create = function(...args) {
    this.canvas = null;
    this.context = null;
    this.mouse_pressed = false;
    this.pixel_ratio = 1;
    this.draw_mode = 'p';
    this.event_delegate = {};
    this.draw_callbacks = [];

    this.background_color = '#FFFFFF'; // Can be transparent

    this.point_format = {
        color: '#000000',
        thickness: 1
    };
    this.line_format = {
        color: '#000000',
        thickness: 1
    };
    this.text_format = {
        color: '#000000',
        background_color: '#FFFFFF', // Color, 'none', 'transparent'
        background_indent: vec2(0, 0),
        font: 'italic 9pt sans-serif',
        offset: vec2(0, 0),
        align: 'left',
        baseline: 'top',
        fit: false, // Moves text inside plane when at least part of bounding box is inside
        fit_vertical: false,
        fit_horizontal: false,
        bound: false, // Moves text inside plane always
        bound_vertical: false,
        bound_horizontal: false,
        indent: vec2(0, 0), // Works only with fit or bound
    };

    this.grid_axis_format = {
        color: '#000000',
        thickness: 1.8
    };
    this.grid_line_format = {
        color: '#000000',
        thickness: 0.9
    };
    this.grid_line_minor_format = {
        color: '#000000',
        thickness: 0.2
    };
    this.grid_text_horizontal_format = {
        color: '#000000',
        background_color: '#FFFFFF',
        background_indent: vec2(1, 1),
        font: '9pt sans-serif',
        offset: vec2(-1, 5),
        align: 'center',
        baseline: 'top',
        fit: true,
        fit_vertical: true,
        fit_horizontal: true,
        bound: false,
        bound_vertical: true,
        bound_horizontal: false,
        indent: vec2(2, 2),
    };
    this.grid_text_vertical_format = {
        color: '#000000',
        background_color: '#FFFFFF',
        background_indent: vec2(1, 1),
        font: '9pt sans-serif',
        offset: vec2(-3, 0),
        align: 'right',
        baseline: 'middle',
        fit: true,
        fit_vertical: true,
        fit_horizontal: true,
        bound: false,
        bound_vertical: false,
        bound_horizontal: true,
        indent: vec2(2, 2),
    };

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
        this.plane = new AnimatedPlane2D(null, this.animation_loop);
        this.plane.init_view(this.canvas.clientWidth * this.pixel_ratio, this.canvas.clientHeight * this.pixel_ratio);
    }
    if (this.canvas) {
        this.attach_canvas();
    }
}

Canvas2D.prototype.attach_canvas = function() { let canvas2d = this;
    canvas2d.event_delegate.onmousedown = function(event) {
        canvas2d.mouse_pressed = true;
    }
    canvas2d.event_delegate.onmouseup = function(event) {
        canvas2d.mouse_pressed = false;
    }
    canvas2d.event_delegate.onmousemove = function(event) {
        if (canvas2d.mouse_pressed) {
            canvas2d.plane.move_for(event.movementX * canvas2d.pixel_ratio, event.movementY * canvas2d.pixel_ratio);
        }
    }
    canvas2d.event_delegate.onresize = function(event) {
        canvas2d.plane.resize_view(event.contentBoxSize[0].inlineSize, event.contentBoxSize[0].blockSize);
    }
    canvas2d.event_delegate.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        canvas2d.plane.scale_at(event.offsetX * canvas2d.pixel_ratio, event.offsetY * canvas2d.pixel_ratio, Math.sign(event.deltaY));
    }
    
    canvas2d.element_observer.observe(canvas2d.canvas, canvas2d.event_delegate, 'resize', 'mouse_all');
    
    canvas2d.animation_loop.add_on_update(function(dt, elapsed) {
        const canvas = this.canvas;
        const pixel_ratio = this.pixel_ratio;
        if (canvas.width != canvas.clientWidth * pixel_ratio || canvas.height != canvas.clientHeight * pixel_ratio) {
            canvas.width = canvas.clientWidth * pixel_ratio;
            canvas.height = canvas.clientHeight * pixel_ratio;
        }

        const context = this.context;
        const background_color = this.background_color;
        if (background_color == 'transparent') {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            context.fillStyle = background_color;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        this.draw_grid_lines();

        for (callback of this.draw_callbacks) {
            callback(this.plane, dt, elapsed);
        }

        this.draw_grid_labels();

    }.bind(this));
    canvas2d.animation_loop.start();
}

Canvas2D.prototype.draw_grid_lines = function() {
    for (let x of this.plane.vertical_lines_minor) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_line_plane(x, this.plane.min.y, x, this.plane.max.y, this.grid_line_minor_format);
    }
    for (let x of this.plane.vertical_lines) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_line_plane(x, this.plane.min.y, x, this.plane.max.y, this.grid_line_format);
    }
    for (let y of this.plane.horizontal_lines_minor) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_line_plane(this.plane.min.x, y, this.plane.max.x, y, this.grid_line_minor_format);
    }
    for (let y of this.plane.horizontal_lines) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_line_plane(this.plane.min.x, y, this.plane.max.x, y, this.grid_line_format);
    }
    if (this.plane.vertical_axis_visible) {
        this.draw_line_plane(0, this.plane.min.y, 0, this.plane.max.y, this.grid_axis_format);
    }
    if (this.plane.horizontal_axis_visible) {
        this.draw_line_plane(this.plane.min.x, 0, this.plane.max.x, 0, this.grid_axis_format);
    }
}
Canvas2D.grid_number_formatter = function(number) {
    let text = (number).toFixed(12);
    if (text.match(/\./))
        return text.replace(/[.]*[0]+$/, '');
    return text;
}
Canvas2D.prototype.draw_grid_labels = function() {
    for (let x of this.plane.vertical_lines) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_text_plane(Canvas2D.grid_number_formatter(x), x, 0, this.grid_text_horizontal_format);
    }
    for (let y of this.plane.horizontal_lines) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_text_plane(Canvas2D.grid_number_formatter(y), 0, y, this.grid_text_vertical_format);
    }
    if (this.plane.vertical_axis_visible || this.plane.horizontal_axis_visible) {
        let offset = vec2(this.grid_text_vertical_format.offset.x, this.grid_text_horizontal_format.offset.y);
        this.draw_text_plane('0', 0, 0, {offset: offset, baseline: 'top'}, this.grid_text_vertical_format);
    }
}
