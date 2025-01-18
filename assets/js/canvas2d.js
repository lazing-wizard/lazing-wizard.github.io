
//

import { vec2 } from './math/mat.js';
import ElementObserver from './element-observer/element-observer-aggregate.js';
import AnimationLoop from './animation-loop.js';
import AnimatedPlane2D from './math/animated-plane2d.js';
import Plane2D from './math/plane2d.js';

import { priority_member_chose, clamp } from './algorithms/array-mods.js';

export default class Canvas2D {
    constructor(...args) { this.create(...args); };
}

Canvas2D.prototype.set_canvas = function(canvas) {
    return this;
};

Canvas2D.prototype.set_pixel_ratio = function(pixel_ratio) {
    return this;
};

Canvas2D.prototype.draw_point = function(x, y, format, base_format) {
    const ctx = this.context;
    if (!base_format) base_format = this.point_format;
    if (!format) format = base_format;

    ctx.fillStyle = priority_member_chose(format, 'color', base_format, 'color');
    const thickness = priority_member_chose(format, 'thickness', base_format, 'thickness');

    x -= thickness/2;
    y -= thickness/2;
    ctx.fillRect(x, y, thickness, thickness);

    return this;
};

Canvas2D.prototype.draw_point_plane = function(x, y, format, base_format) {
    [x, y] = this.plane.to_view(x, y);
    return this.draw_point(x, y, format, base_format);
};


Canvas2D.prototype.draw_line = function(x0, y0, x1, y1, format, base_format) {
    const ctx = this.context;
    if (!base_format) base_format = this.line_format;
    if (!format) format = base_format;

    ctx.strokeStyle = priority_member_chose(format, 'color', base_format, 'color');
    ctx.lineWidth = priority_member_chose(format, 'thickness', base_format, 'thickness');

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    return this;
};
Canvas2D.prototype.draw_line_plane = function(x0, y0, x1, y1, format, base_format) {
    [x0, y0] = this.plane.to_view(x0, y0);
    [x1, y1] = this.plane.to_view(x1, y1);
    return this.draw_line(x0, y0, x1, y1, format, base_format);
};

// Baseline: top, hanging, middle, alphabetic, ideographic, bottom
// Align: left, center, right, start, end
Canvas2D.prototype.draw_text = function(text, x, y, format, base_format) {
    const ctx = this.context;
    if (!base_format) base_format = this.text_format;
    if (!format) format = base_format;

    ctx.font = priority_member_chose(format, 'font', base_format, 'font');
    ctx.textBaseline = priority_member_chose(format, 'baseline', base_format, 'baseline');
    ctx.textAlign = priority_member_chose(format, 'align', base_format, 'align');
    const offset = priority_member_chose(format, 'offset', base_format, 'offset');
    // If text is in visible area but goes beyond screen edges it will fit
    const fit_vertical = priority_member_chose(format, 'fit_vertical', format, 'fit', base_format,
        'fit_vertical', base_format, 'fit');
    const fit_horizontal = priority_member_chose(format, 'fit_horizontal', format, 'fit', base_format,
        'fit_horizontal', base_format, 'fit');
    const bound_vertical = priority_member_chose(format, 'bound_vertical', format, 'bound', base_format,
        'bound_vertical', base_format, 'bound');
    const bound_horizontal = priority_member_chose(format, 'bound_horizontal', format, 'bound', base_format,
        'bound_horizontal', base_format, 'bound');
    const indent = priority_member_chose(format, 'indent', base_format, 'indent');
    const background_color = priority_member_chose(format, 'background_color', base_format, 'background_color');
    const background_indent = priority_member_chose(format, 'background_indent', base_format, 'background_indent');

    if (!(typeof text === 'string'))
        text = (text).toString();
    
    const fit_position = function(fit, bound, pos, offset, indent, box_left, box_right, border_pos_left, border_pos_right) {
        if (fit || bound) {
            const left_border = border_pos_left + indent;
            const right_border = border_pos_right - indent;
            
            const visible_box_left = Math.min(offset - box_left, 0);
            const visible_pos_left = pos + visible_box_left;

            const visible_box_right = Math.max(offset + box_right, 0);
            const visible_pos_right = pos + visible_box_right;

            const should_be_visible = bound || (visible_pos_right >= border_pos_left && visible_pos_left <= border_pos_right);
            if (should_be_visible) {
                pos = clamp(pos + offset, left_border + box_left, right_border - box_right);
            }
            return pos;
        }
    };

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
    
    ctx.fillStyle = priority_member_chose(format, 'color', base_format, 'color');
    ctx.fillText(text, x, y);
    return this;
};

Canvas2D.prototype.draw_text_plane = function(text, x, y, format, base_format) {
    [x, y] = this.plane.to_view(x, y);
    return this.draw_text(text, x, y, format, base_format);
};

Canvas2D.prototype.add_draw = function(callback) {
    this.draw_callbacks.push(callback);
};



// Implementation

Canvas2D.prototype.create = function(...args) {
    this.canvas = null;
    this.canvas_size = vec2(1, 1);
    this.context = null;
    this.mouse_pressed = false;
    this.device_pixel_ratio = 1;
    this.pixel_ratio = 1;
    this.pixel_ratio_modifier = 1.0;
    this.draw_mode = 'p';
    this.event_delegate = {};
    this.draw_callbacks = [];

    this.preserve_ratio = true;

    this.average_touch_point = vec2(0, 0);
    this.average_touch_point_prev = vec2(0, 0);
    this.average_touch_distance = 0;
    this.average_touch_distance_prev = 0;

    this.buf1 = vec2();
    this.buf2 = vec2();
    this.buf3 = vec2();

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
        thickness: 2
    };
    this.grid_line_format = {
        color: '#B8B8B8',
        thickness: 2
    };
    this.grid_line_minor_format = {
        color: '#F0F0F0',
        thickness: 2
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

    for (const arg of args) {
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
        this.canvas_size.x = this.canvas.clientWidth;
        this.canvas_size.y = this.canvas.clientHeight;
        this.plane.init_view(this.canvas_size.x * this.pixel_ratio, this.canvas_size.y * this.pixel_ratio);
    }
    if (this.canvas) {
        this.attach_canvas();
    }
};

Canvas2D.prototype.attach_canvas = function() {
    this.event_delegate.onmousedown = function(event) {
        this.mouse_pressed = true;
    }.bind(this);
    this.event_delegate.onmouseup = function(event) {
        this.mouse_pressed = false;
    }.bind(this);
    this.event_delegate.onmousemove = function(event) {
        if (this.mouse_pressed) {
            this.plane.move_for(event.movementX / window.devicePixelRatio * this.pixel_ratio, event.movementY / window.devicePixelRatio * this.pixel_ratio);
        }
    }.bind(this);
    this.event_delegate.onresize = function(event) {
        this.canvas_size.x = event.contentBoxSize[0].inlineSize;
        this.canvas_size.y = event.contentBoxSize[0].blockSize;
        /// Remove pixel_ratio from here and leave Plane2D with original size
        /// Instead account for ratio changes when drawing
        this.plane.resize_view(this.canvas_size.x * this.pixel_ratio, this.canvas_size.y * this.pixel_ratio);
    }.bind(this);
    this.event_delegate.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        this.plane.scale_at(event.offsetX * this.pixel_ratio, event.offsetY * this.pixel_ratio, Math.sign(event.deltaY));
    }.bind(this);
    // Move of average point is move_for
    // Scale is the difference of average distance at the average point
    this.event_delegate.ontouchstart = function(event) {
        event.preventDefault();
        event.stopPropagation();

        this.average_touch_point.assign(0, 0);
        
        for (let i = 0; i < event.touches.length; ++i) {
            const touch = event.touches[i];

            const x = touch.clientX - this.canvas.getBoundingClientRect().left;
            const y = touch.clientY - this.canvas.getBoundingClientRect().top;

            this.average_touch_point.x += x;
            this.average_touch_point.y += y;
        }
        this.average_touch_point.mul_inplace(1.0 / event.touches.length);

        if (this.average_touch_point.x < 30 && this.average_touch_point.y < 30) {
            this.preserve_ratio = !this.preserve_ratio;
        }

        this.average_touch_distance = 0;

        const [v1, v2, v3] = [this.buf1, this.buf2, this.buf3];

        let x0 = event.touches[0].clientX - this.canvas.getBoundingClientRect().left;
        let y0 = event.touches[0].clientY - this.canvas.getBoundingClientRect().top;
        for (let i = 1; i < event.touches.length; ++i) {
            const touch = event.touches[i];

            const x1 = touch.clientX - this.canvas.getBoundingClientRect().left;
            const y1 = touch.clientY - this.canvas.getBoundingClientRect().top;

            this.average_touch_distance += v1.assign(x0, y0).sub(v2.assign(x1, y1), v3).length;
            
            x0 = x1;
            y0 = y1;
        }
        const x1 = event.touches[0].clientX - this.canvas.getBoundingClientRect().left;
        const y1 = event.touches[0].clientY - this.canvas.getBoundingClientRect().top;

        this.average_touch_distance += v1.assign(x0, y0).sub(v2.assign(x1, y1), v3).length;
        
        this.average_touch_distance /= event.touches.length + 1;
    }.bind(this);
    this.event_delegate.ontouchmove = function(event) {
        event.preventDefault();
        event.stopPropagation();

        this.average_touch_point_prev.assign(this.average_touch_point);
        this.average_touch_point.assign(0, 0);
        
        for (let i = 0; i < event.touches.length; ++i) {
            const touch = event.touches[i];

            const x = touch.clientX - this.canvas.getBoundingClientRect().left;
            const y = touch.clientY - this.canvas.getBoundingClientRect().top;
            
            this.average_touch_point.x += x;
            this.average_touch_point.y += y;
        }
        this.average_touch_point.mul_inplace(1.0 / event.touches.length);

        const v = this.buf1;
        v.assign(this.average_touch_point).sub_inplace(this.average_touch_point_prev).mul_inplace(this.pixel_ratio);
        
        this.plane.move_for(v.x, v.y);

        /*this.average_touch_distance_prev = this.average_touch_distance;
        this.average_touch_distance = 0;

        let [v1, v2, v3] = [this.buf1, this.buf2, this.buf3];

        let x0 = event.touches[0].clientX - this.canvas.getBoundingClientRect().left;
        let y0 = event.touches[0].clientY - this.canvas.getBoundingClientRect().top;
        for (let i = 1; i < event.touches.length; ++i) {
            let touch = event.touches[i];

            let x1 = touch.clientX - this.canvas.getBoundingClientRect().left;
            let y1 = touch.clientY - this.canvas.getBoundingClientRect().top;

            this.average_touch_distance += v1.assign(x0, y0).sub(v2.assign(x1, y1), v3).length;
            
            x0 = x1;
            y0 = y1;
        }
        let x1 = event.touches[0].clientX - this.canvas.getBoundingClientRect().left;
        let y1 = event.touches[0].clientY - this.canvas.getBoundingClientRect().top;

        this.average_touch_distance += v1.assign(x0, y0).sub(v2.assign(x1, y1), v3).length;

        this.average_touch_distance /= event.touches.length + 1;

        this.plane.scale_at(this.average_touch_point, (this.average_touch_distance - this.average_touch_distance_prev)*this.pixel_ratio);
        */
    }.bind(this);
    this.event_delegate.ontouchend = function(event) {
        event.preventDefault();
        event.stopPropagation();
    }.bind(this);
    this.element_observer.observe(this.canvas, this.event_delegate, 'resize', 'mouse_all', 'touch_all');
    
    
    this.animation_loop.add_on_update(function(dt, elapsed) {
        const canvas = this.canvas;

        /// Write pixel_ratio logic
        
        let need_resize = false;
        if (this.preserve_ratio && (this.device_pixel_ratio != window.devicePixelRatio)) {
            console.log('PRESERVING');
            this.device_pixel_ratio = window.devicePixelRatio;
            const pr = this.device_pixel_ratio;
            if (pr < 4/3) {
                this.pixel_ratio = pr;
            } else if (pr >= 4/3 && pr < 2) {
                this.pixel_ratio = pr * 3/4;
            } else if (pr >= 2 && pr < 3) {
                this.pixel_ratio = pr * 1/2;
            } else if (pr >= 3 && pr < 4) {
                this.pixel_ratio = pr * 1/3;
            } else {
                this.pixel_ratio = pr * 1/4;
            }
            //this.pixel_ratio *= this.pixel_ratio_modifier;
            //canvas.width = 1; canvas.height = 1;
            need_resize = true;
        }
        
        if (!this.preserve_ratio) {
            console.log('NOT PRESERVING');
            if (this.pixel_ratio == 1)
                need_resize = false;
            else
                need_resize = true;
            this.pixel_ratio = 1;
            this.device_pixel_ratio = 1;
        }

        if (need_resize || canvas.width != this.plane.view_size.x || canvas.height != this.plane.view_size.y) {
            canvas.width = this.canvas_size.x * this.pixel_ratio;
            canvas.height = this.canvas_size.y * this.pixel_ratio;
            this.plane.resize_view(canvas.width, canvas.height);
        }

        //console.log(canvas.clientWidth, canvas.clientHeight, canvas.width, canvas.height, window.devicePixelRatio, this.pixel_ratio);

        const context = this.context;
        if (this.background_color == 'transparent') {
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            context.fillStyle = this.background_color;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        this.draw_grid_lines();

        for (const callback of this.draw_callbacks) {
            callback(this.plane, dt, elapsed);
        }

        const scale = 5*this.plane.size.x/this.plane.view_size.x;
        let x0 = this.plane.min.x;
        let x1 = x0 + scale;
        for (; x1 < this.plane.max.x; x1 += scale) {
            this.draw_line_plane(x0, Math.sin(x0), x1, Math.sin(x1), {color: '#0000AF', thickness: 2});
            x0 = x1;
        }

        this.draw_grid_labels();
        this.draw_info();
    }.bind(this));
    this.animation_loop.start();
};

Canvas2D.prototype.draw_grid_lines = function() {
    if (this.tempa != this.plane.vertical_lines.length){
        //console.log('Vertical', this.plane.vertical_lines.length);
        this.tempa = this.plane.vertical_lines.length;
    }
    if (this.tempb != this.plane.horizontal_lines.length){
        //console.log('Horizontal', this.plane.horizontal_lines.length);
        this.tempb = this.plane.horizontal_lines.length;
    }
    for (const x of this.plane.vertical_lines_minor) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_line_plane(x, this.plane.min.y, x, this.plane.max.y, this.grid_line_minor_format);
    }
    for (const y of this.plane.horizontal_lines_minor) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_line_plane(this.plane.min.x, y, this.plane.max.x, y, this.grid_line_minor_format);
    }
    for (const x of this.plane.vertical_lines) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_line_plane(x, this.plane.min.y, x, this.plane.max.y, this.grid_line_format);
    }
    for (const y of this.plane.horizontal_lines) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_line_plane(this.plane.min.x, y, this.plane.max.x, y, this.grid_line_format);
    }
    if (this.plane.vertical_axis_visible) {
        this.draw_line_plane(0, this.plane.min.y, 0, this.plane.max.y, this.grid_axis_format);
    }
    if (this.plane.horizontal_axis_visible) {
        this.draw_line_plane(this.plane.min.x, 0, this.plane.max.x, 0, this.grid_axis_format);
    }
};
Canvas2D.grid_number_formatter = function(number) {
    const text = (number).toFixed(12);
    if (text.match(/\./))
        return text.replace(/[.]*[0]+$/, '');
    return text;
};
Canvas2D.prototype.draw_grid_labels = function() {
    for (const x of this.plane.vertical_lines) {
        if (Math.abs(x) < 1e-12) continue;
        this.draw_text_plane(Canvas2D.grid_number_formatter(x), x, 0, this.grid_text_horizontal_format);
    }
    for (const y of this.plane.horizontal_lines) {
        if (Math.abs(y) < 1e-12) continue;
        this.draw_text_plane(Canvas2D.grid_number_formatter(y), 0, y, this.grid_text_vertical_format);
    }
    if (this.plane.vertical_axis_visible || this.plane.horizontal_axis_visible) {
        const offset = vec2(this.grid_text_vertical_format.offset.x, this.grid_text_horizontal_format.offset.y);
        this.draw_text_plane('0', 0, 0, {offset: offset, baseline: 'top', bound_vertical: true}, this.grid_text_vertical_format);
    }
};

Canvas2D.prototype.draw_info = function() {
    let off = 5;
    this.draw_text(`Client size: ${this.canvas.clientWidth}x ${this.canvas.clientHeight}y`, 5, off); off+=15;
    this.draw_text(`Canvas size: ${this.canvas.width}x ${this.canvas.height}y`, 5, off); off+=15;
    this.draw_text('DPR: ' + window.devicePixelRatio, 5, off); off+=15;
    this.draw_text('PR: ' + this.pixel_ratio, 5, off); //off+=15;
};