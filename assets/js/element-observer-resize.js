
function ElementResizeObserver(...args) {
    ElementObserverBase.call(this, ...args);
    ElementResizeObserver.prototype.create.call(this);
}
ElementResizeObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementResizeObserver.prototype.constructor = ElementResizeObserver;

create_static_data_descriptors(ElementResizeObserver, ElementObserverBase);



// Implementation

ElementResizeObserver.all_keyword = 'resize_all';
ElementResizeObserver.supported_event_types = ['resize'];

ElementResizeObserver.instance_data_properties = ElementResizeObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementResizeObserver);

ElementResizeObserver.prototype.create = function() {
    this.resize_listener = new ResizeObserver(function(entries) {
        const method = this.construct_name('resize');
        this.delegates.forEach((delegate) => {
            if (delegate && method in delegate)
                // Handle only last entry
                delegate[method](entries[entries.length - 1]);
        });
    }.bind(this));
}

ElementResizeObserver.prototype.attach_listener = function() {
    this.resize_listener.observe(this.element);
}

ElementResizeObserver.prototype.detach_listener = function() {
    this.resize_listener.unobserve(this.element);
}
