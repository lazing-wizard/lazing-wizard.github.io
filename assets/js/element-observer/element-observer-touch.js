
import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import ElementObserverBase from './element-observer-base.js';

export default class ElementTouchObserver extends ElementObserverBase {
    constructor(...args) {
        super(...args);
        ElementTouchObserver.prototype.create.call(this);
    }
    static instance_data_properties = null;
}
create_static_data_descriptors(ElementTouchObserver, ElementObserverBase);
ElementTouchObserver.all_keyword = 'touch_all';
ElementTouchObserver.supported_event_types = [
    'touchstart', 'touchend', 'touchmove', 'touchcancel'
];
ElementTouchObserver.instance_data_properties = ElementTouchObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementTouchObserver);



// Implementation

ElementTouchObserver.prototype.create = function() {};

ElementTouchObserver.prototype.attach_listener = function(event_type) {
    this[`${event_type}_listener`] = (event) => {
        this.delegates.forEach(delegate => {
            const method = this.construct_name(event_type);
            if (method in delegate) {
                delegate[method](event);
            }
        });
    };
    this.element.addEventListener(event_type, this[`${event_type}_listener`], {passive: false});
};

ElementTouchObserver.prototype.detach_listener = function(event) {
    this.element.removeEventListener(event, this[`${event}_listener`]);
    this[`${event}_listener`] = null;
};
