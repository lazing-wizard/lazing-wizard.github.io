
import { vec2 } from '../../math/mat.js';

export default function common_style(manager) {
    manager.add('global', {
        'thickness_scale': 1
    });
    manager.add('background', {
        color: '#FFFFFF'
    });
    manager.add('point', {
        color: '#000000',
        thickness: 1
    }, 'global');
    manager.add('line', {
        color: '#000000',
        thickness: 1
    }, 'global');
    manager.add('text', {
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
    }, 'global');
    manager.text.add_property_relations('fit', ['fit_vertical', 'fit_horizontal']);

    manager.add('grid_axis', {
        color: '#000000',
        thickness: 2
    }, 'line');
    manager.add('grid_line', {
        color: '#B8B8B8',
        thickness: 2
    }, 'line');
    manager.add('grid_minor_line', {
        color: '#F0F0F0',
        thickness: 2
    }, 'line');
    manager.add('grid_text_horizontal', {
        background_indent: vec2(1, 1),
        font: '9pt sans-serif',
        offset: vec2(-1, 5),
        align: 'center',
        fit: true,
        fit_vertical: true,
        fit_horizontal: true,
        bound: false,
        bound_vertical: true,
        bound_horizontal: false,
        indent: vec2(2, 2)
    }, 'text');
    manager.add('grid_text_vertical', {
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
    }, 'text');
}
