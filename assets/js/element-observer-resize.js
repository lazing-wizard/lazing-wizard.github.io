
function ElementResizeObserver(element, ...args) { ElementObserverBase.call(this, element, ...args); this.create(); }
ElementResizeObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementResizeObserver.prototype.constructor = ElementResizeObserver;

ElementResizeObserver.all_keyword = 'resize_all';
ElementResizeObserver.supported_event_types = ['resize'];



// Implementation

ElementResizeObserver.prototype.attach_listener = function() {
    this.resize_listener.observe(this.element);
}

ElementResizeObserver.prototype.detach_listener = function() {
    this.resize_listener.unobserve(this.element);
}

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
