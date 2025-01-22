
import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import ElementObserverBase from './element-observer-base.js';

export default class ElementResizeObserver extends ElementObserverBase {
    constructor(...args) {
        super(...args);
        ElementResizeObserver.prototype.create.call(this);
    }
    static instance_data_properties = null;
}
create_static_data_descriptors(ElementResizeObserver, ElementObserverBase);
ElementResizeObserver.all_keyword = 'resize_all';
ElementResizeObserver.supported_event_types = ['resize'];
ElementResizeObserver.instance_data_properties = ElementResizeObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementResizeObserver);



// Implementation

ElementResizeObserver.prototype.create = function() {
    this.resize_listener = new ResizeObserver(function(entries) {
        const method = this.construct_name('resize');
        this.delegates.forEach((delegate) => {
            if (delegate && method in delegate)
                // Handle only last entry
                delegate[method](entries[entries.length - 1]);
        });
    }.bind(this));
};

ElementResizeObserver.prototype.attach_listener = function() {
    this.resize_listener.observe(this.element);
};

ElementResizeObserver.prototype.detach_listener = function() {
    this.resize_listener.unobserve(this.element);
};
