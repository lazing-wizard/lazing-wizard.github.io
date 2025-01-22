
import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import ElementObserverBase from './element-observer-base.js';

export default class ElementKeyboardObserver extends ElementObserverBase {
    constructor(...args) {
        super(...args);
        ElementKeyboardObserver.prototype.create.call(this);
    }
    static instance_data_properties = null;
}
create_static_data_descriptors(ElementKeyboardObserver, ElementObserverBase);
ElementKeyboardObserver.all_keyword = 'keyboard_all';
ElementKeyboardObserver.supported_event_types = [
    'keydown', 'keyup', 'keypress'
];
ElementKeyboardObserver.instance_data_properties = ElementKeyboardObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementKeyboardObserver);



// Implementation

ElementKeyboardObserver.prototype.create = function() {};
