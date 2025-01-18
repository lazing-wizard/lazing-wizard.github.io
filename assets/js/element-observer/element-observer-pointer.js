
import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import ElementObserverBase from './element-observer-base.js';

export default class ElementPointerObserver extends ElementObserverBase {
    constructor(...args) {
        super(...args);
        ElementPointerObserver.prototype.create.call(this);
    }
    static instance_data_properties = null;
}
create_static_data_descriptors(ElementPointerObserver, ElementObserverBase);
ElementPointerObserver.all_keyword = 'pointer_all';
ElementPointerObserver.supported_event_types = [
    'pointerdown', 'pointerup', 'pointermove', 'pointerover', 
    'pointerout', 'pointerenter', 'pointerleave', 'pointercancel',
    'gotpointercapture', 'lostpointercapture'
];
ElementPointerObserver.instance_data_properties = ElementPointerObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementPointerObserver);



// Implementation

ElementPointerObserver.prototype.create = function() {};
