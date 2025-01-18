
import { vec2 } from '../math/mat.js';

export class StyleManager{ 
    constructor() { this.create(); };
}

StyleManager.prototype.line = function(attribute, format, base_format) {

};



// Implementation

StyleManager.prototype.create = function() {
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
};