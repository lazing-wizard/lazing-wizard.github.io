
function ElementTouchObserver(element, ...args) { ElementObserverBase.call(this, element, ...args); this.create(); }
ElementTouchObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementTouchObserver.prototype.constructor = ElementTouchObserver;

ElementTouchObserver.all_keyword = 'touch_all';
ElementTouchObserver.supported_event_types = [
    'touchstart', 'touchend', 'touchmove', 'touchcancel'
];

// Implementation

ElementTouchObserver.prototype.create = function() {}

ElementTouchObserver.prototype.attach_listener = function(event_type) {
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

ElementTouchObserver.prototype.detach_listener = function(event) {
    this.element.removeEventListener(event, this[`${event}_listener`]);
    this[`${event}_listener`] = null;
}
