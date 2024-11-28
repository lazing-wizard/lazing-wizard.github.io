
// Proxy class between certain element and subscription on it's events

// Invoked functions are names of the event with custom prependings to them
// Size event function is called 'onresize' and accepts single argument

function ElementObserver(...args) { this.create(...args); }

ElementObserver.static_data_properties = ['handler_types', 'supported_event_types'];
create_static_data_descriptors(ElementObserver);


ElementObserver.handler_types = [
    ElementResizeObserver,
    ElementMouseObserver,
    ElementKeyboardObserver,
    ElementTouchObserver,
    ElementPointerObserver
];

ElementObserver.supported_event_types = ElementObserver.handler_types.reduce(
    (accumulated, handler) => array_union(accumulated, handler.supported_event_types), 
    []
);



// Implementation

ElementObserver.instance_data_properties = ['handlers'];
create_instance_data_descriptors(ElementObserver);

ElementObserver.prototype.create = function(...args) {
    this.handlers = [];
    this.handler_types.forEach(handler => {
        this.handlers.push(new handler(...args));
    });
}

ElementObserver.prototype.attach_listeners = function() { throw new Error('Not for calling'); }
ElementObserver.prototype.detach_listeners = function() { throw new Error('Not for calling'); }
ElementObserver.prototype.attach_listener = function() { throw new Error('Not for calling'); }
ElementObserver.prototype.detach_listener = function() { throw new Error('Not for calling'); }

const observer_base_methods = Object.getOwnPropertyNames(ElementObserverBase.prototype)
        .filter((method) => typeof ElementObserverBase.prototype[method] === 'function');
const observer_aggregate_methods = Object.getOwnPropertyNames(ElementObserver.prototype)
        .filter((method) => typeof ElementObserver.prototype[method] === 'function');
observer_base_methods.forEach((method) => {
    if (!observer_aggregate_methods.find((aggregate_method) => aggregate_method == method)) {
        ElementObserver.prototype[method] = function(...args) {
            this.handlers.forEach((handler) => {
                handler[method](...args);
            });
        }
    }
});
