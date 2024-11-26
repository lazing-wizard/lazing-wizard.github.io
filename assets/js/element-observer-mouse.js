
function ElementMouseObserver(element, ...args) {
    ElementObserverBase.call(this, element, ...args);
    ElementMouseObserver.prototype.create.call(this, ...args);
}
ElementMouseObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementMouseObserver.prototype.constructor = ElementMouseObserver;

create_static_data_descriptors(ElementMouseObserver, ElementObserverBase);



// Implementation

ElementMouseObserver.all_keyword = 'mouse_all';
ElementMouseObserver.supported_event_types = [
    // MouseEvent
    'click', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave',
    'mousemove', 'mouseout', 'mouseover', 'mouseup',
    // WheelEvent
    'wheel'
];

ElementMouseObserver.instance_data_properties = ElementMouseObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementMouseObserver);

ElementMouseObserver.prototype.create = function() {}

ElementMouseObserver.prototype.attach_listener = function(event_type) {
    this[`${event_type}_listener`] = (event) => {
        this.delegates.forEach(delegate => {
            const method = this.construct_name(event_type);
            if (method in delegate) {
                delegate[method](event);
            }
        });
    }
    this.element.addEventListener(event_type, this[`${event_type}_listener`]);
}

ElementMouseObserver.prototype.detach_listener = function(event) {
    this.element.removeEventListener(event, this[`${event}_listener`]);
    this[`${event}_listener`] = null;
}
