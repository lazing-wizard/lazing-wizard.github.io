
// Base class for specific event types observers
// Different event types, for example resize and mouse require specific subscription logic
// and subclasses of this one implement it
// BaseObserver implements common operations like adding, removing subscribers and events
// Subclasses overwrite supported_event_types static variable with event types that they take,
// all_keyword static variable to select all of supported_event_types,
// create function to initialize underlying event system variables
// attach_listener and detach_listener for specific event of supported_event_types

import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import { reduce_arrays } from '../algorithms/array-mods.js';
import { append_unique_to, append_unique_to_begin, remove_elements_from} from '../algorithms/array-mods.js';
import { array_intersection, array_subtraction } from '../algorithms/array-mods.js';

export default class ElementObserverBase {
    constructor(...args) { ElementObserverBase.prototype.create.call(this, ...args); };
    static static_data_properties = ['all_keyword', 'supported_event_types'];
    static instance_data_properties = ['element', 'delegates', 'attached_events', 'prefix', 'postfix'];
}
create_static_data_descriptors(ElementObserverBase);
create_instance_data_descriptors(ElementObserverBase);
ElementObserverBase.all_keyword = '';
ElementObserverBase.supported_event_types = [];

// Appends objects that will have callbacks called
ElementObserverBase.prototype.add_delegate = ElementObserverBase.prototype.add_delegates = function(...delegates) {
    append_unique_to(this.delegates, ...reduce_arrays(delegates));
    return this;
};
ElementObserverBase.prototype.set_delegate = ElementObserverBase.prototype.set_delegates = function(...delegates) {
    this.clear_delegates().add_delegates(...delegates);
    return this;
};
ElementObserverBase.prototype.add_delegate_begin = ElementObserverBase.prototype.add_delegates_begin = function(...delegates) {
    append_unique_to_begin(this.delegates, ...reduce_arrays(delegates));
    return this;
};
ElementObserverBase.prototype.remove_delegate = ElementObserverBase.prototype.remove_delegates = function(...delegates) {
    remove_elements_from(this.delegates, ...reduce_arrays(delegates));
    return this;
};
ElementObserverBase.prototype.clear_delegate = ElementObserverBase.prototype.clear_delegates = function() {
    this.delegates.length = 0;
    return this;
};

// Appends events
// If 'all' or 'all_events' is passed then all events will be binded
// If 'mouse_all/touch_all/resize_all/keyboard_all/pointer_all' passed related events are binded
ElementObserverBase.prototype.add_event = ElementObserverBase.prototype.add_events = function(...events) {
    events = reduce_arrays(events);
    if (events.includes(this.all_keyword) || events.includes('all') || events.includes('all_events')) 
        events = this.supported_event_types;
    events = array_intersection(reduce_arrays(events), this.supported_event_types);
    const events_to_attach = array_subtraction(reduce_arrays(events), this.attached_events);
    if (this.element) {
        events_to_attach.forEach((event) => {
            this.attach_listener(event);
        });
    }
    this.attached_events.push(...events_to_attach);
    return this;
};
ElementObserverBase.prototype.remove_event = ElementObserverBase.prototype.remove_events = function(...events) {
    events = reduce_arrays(events);
    if (events.includes(this.all_keyword) || events.includes('all')) 
        events = this.supported_event_types;
    events = array_intersection(reduce_arrays(events), this.supported_event_types);
    const detached_events = array_intersection(reduce_arrays(events), this.attached_events);
    if (this.element) {
        detached_events.forEach((event) => {
            this.detach_listener(event);
        });
    }
    remove_elements_from(this.attached_events, ...detached_events);
    return this;
};
ElementObserverBase.prototype.set_event = ElementObserverBase.prototype.set_events = function(...events) {
    events = reduce_arrays(events);
    const events_to_detach = array_subtraction(this.attached_events, reduce_arrays(events));
    const events_to_attach = array_subtraction(reduce_arrays(events), this.attached_events);
    this.remove_events(...events_to_detach);
    this.add_events(...events_to_attach);
    return this;
};
ElementObserverBase.prototype.clear_events = ElementObserverBase.prototype.clear_events = function() {
    this.attached_events.forEach((event) => {
        this.detach_listener(event);
    });
    this.attached_events.length = 0;
    return this;
};

ElementObserverBase.prototype.set_prefix = function(prefix) {
    this.prefix = prefix;
    return this;
};
ElementObserverBase.prototype.set_postfix = function(postfix) {
    this.postfix = postfix;
    return this;
};
ElementObserverBase.prototype.construct_name = function(event_type) {
    return `${this.prefix}${event_type}${this.postfix}`;
};

// If arg of args is a string it is treated as event, otherwise as delegate
ElementObserverBase.prototype.observe = function(element, ...args) {
    const delegates = args.filter((arg) => (typeof arg !== 'string') && arg);
    const events = args.filter((arg) => typeof arg === 'string');
    if (this.element != element) {
        this.unobserve();
        this.element = element;
    }
    if (delegates) {
        this.set_delegates(...delegates);
    }
    if (events) {
        this.set_events(...events);
    } else {
        this.attach_listeners();
    }
    return this;
};
ElementObserverBase.prototype.unobserve = function() {
    if (this.element) {
        this.detach_listeners();
        this.element = null;
    }
    return this;
};
ElementObserverBase.prototype.clear = function() {
    this.unobserve();
    return this;
};



// Implementation

ElementObserverBase.prototype.create = function(element, ...args) {
    this.element = null;
    this.delegates = [];
    
    this.attached_events = [];

    this.prefix = 'on';
    this.postfix = '';
    
    this.supported_event_types.forEach((event_type) => {
        this[`${event_type}_listener`] = null;
    });

    if (element) {
        this.observe(element, ...args);
    }
};

ElementObserverBase.prototype.attach_listeners = function() {
    this.attached_events.forEach((event) => {
        this.attach_listener(event);
    });
};
ElementObserverBase.prototype.detach_listeners = function() {
    this.attached_events.forEach((event) => {
        this.detach_listener(event);
    });
};

// Correct state of subscriptions is guaranteed for these functions, no checks needed in them
ElementObserverBase.prototype.attach_listener = function() { throw new Error('Not implemented'); };
ElementObserverBase.prototype.detach_listener = function() { throw new Error('Not implemented'); };
