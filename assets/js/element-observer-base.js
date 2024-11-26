
// Common for observers of size, mouse and touch events

function ElementObserverBase(...args) { ElementObserverBase.prototype.create.call(this,...args); }

ElementObserverBase.static_data_properties = ['all_keyword', 'supported_event_types'];
create_static_data_descriptors(ElementObserverBase);


// Appends objects that will have callbacks called
ElementObserverBase.prototype.add_delegate = ElementObserverBase.prototype.add_delegates = function(...delegates) {
    append_unique_to(this.delegates, ...reduce_arrays(delegates));
    return this;
}
ElementObserverBase.prototype.set_delegate = ElementObserverBase.prototype.set_delegates = function(...delegates) {
    this.clear_delegates().add_delegates(...delegates);
    return this;
}
ElementObserverBase.prototype.add_delegate_begin = ElementObserverBase.prototype.add_delegates_begin = function(...delegates) {
    append_unique_to_begin(this.delegates, ...reduce_arrays(delegates));
    return this;
}
ElementObserverBase.prototype.remove_delegate = ElementObserverBase.prototype.remove_delegates = function(...delegates) {
    remove_elements_from(this.delegates, ...reduce_arrays(delegates));
    return this;
}
ElementObserverBase.prototype.clear_delegate = ElementObserverBase.prototype.clear_delegates = function() {
    this.delegates.length = 0;
    return this;
}

// Appends events
// If 'all' 'all_events' is passed then all events will be binded
// If 'mouse_all/touch_all/resize_all/keyboard_all/pointer_all' passed related events are binded
ElementObserverBase.prototype.add_event = ElementObserverBase.prototype.add_events = function(...events) {
    events = reduce_arrays(events);
    if (events.includes(this.all_keyword) || events.includes('all')) 
        events = this.supported_event_types;
    events = array_intersection(reduce_arrays(events), this.supported_event_types);
    const attached_events = array_subtraction(reduce_arrays(events), this.attached_events);
    if (this.element) {
        attached_events.forEach((event) => {
            this.attach_listener(event);
        });
    }
    this.attached_events.push(...attached_events);
    return this;
}
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
}
ElementObserverBase.prototype.set_event = ElementObserverBase.prototype.set_events = function(...events) {
    events = reduce_arrays(events);
    const detached_events = array_subtraction(this.attached_events, reduce_arrays(events));
    const attached_events = array_subtraction(reduce_arrays(events), this.attached_events);
    this.remove_events(...detached_events);
    this.add_events(...attached_events);
    return this;
}
ElementObserverBase.prototype.clear_events = ElementObserverBase.prototype.clear_events = function() {
    this.attached_events.forEach((event) => {
        this.detach_listener(event);
    });
    this.attached_events.length = 0;
    return this;
}

ElementObserverBase.prototype.set_prefix = function(prefix) {
    this.prefix = prefix;
    return this;
}
ElementObserverBase.prototype.set_postfix = function(postfix) {
    this.postfix = postfix;
    return this;
}
ElementObserverBase.prototype.construct_name = function(event_type) {
    return `${this.prefix}${event_type}${this.postfix}`;
}

// If arg of args is a string it is treated as event, otherwise as delegate
ElementObserverBase.prototype.observe = function(element, ...args) {
    const delegates = args.filter((arg) => typeof arg !== 'string');
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
}
ElementObserverBase.prototype.unobserve = function() {
    if (this.element) {
        this.detach_listeners();
        this.element = null;
    }
    return this;
}
ElementObserverBase.prototype.clear = function() {
    this.unobserve();
    return this;
}



// Implementation

ElementObserverBase.all_keyword = '';
ElementObserverBase.supported_event_types = [];

ElementObserverBase.instance_data_properties = ['element', 'delegates', 'attached_events', 'prefix', 'postfix'];
create_instance_data_descriptors(ElementObserverBase);

ElementObserverBase.prototype.create = function(element, ...args) {
    this.element = null;
    this.delegates = [];
    
    this.attached_events = [];

    this.prefix = 'on';
    this.postfix = '';

    //console.log(this);
    //this.contructor.supported_event_types
    this.supported_event_types.forEach((event_type) => {
        this[`${event_type}_listener`] = null;
    });

    if (element) {
        this.observe(element, ...args);
    }
}

ElementObserverBase.prototype.attach_listeners = function() {
    this.attached_events.forEach((event) => {
        this.attach_listener(event);
    });
}
ElementObserverBase.prototype.detach_listeners = function() {
    this.attached_events.forEach((event) => {
        this.detach_listener(event);
    });
}

// Correct state of subscriptions is guaranteed for these functions, no checks needed in them
ElementObserverBase.prototype.attach_listener = function() { throw new Error('Not implemented'); }
ElementObserverBase.prototype.detach_listener = function() { throw new Error('Not implemented'); }
