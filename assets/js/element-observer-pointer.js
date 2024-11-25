
function ElementPointerObserver(element, ...args) { ElementObserverBase.call(this, element, ...args); this.create(); }
ElementPointerObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementPointerObserver.prototype.constructor = ElementPointerObserver;

ElementPointerObserver.all_keyword = 'pointer_all';
ElementPointerObserver.supported_event_types = [
    'pointerdown', 'pointerup', 'pointermove', 'pointerover', 
    'pointerout', 'pointerenter', 'pointerleave', 'pointercancel',
    'gotpointercapture', 'lostpointercapture'
];

ElementPointerObserver.prototype.create = function() {
    
}
