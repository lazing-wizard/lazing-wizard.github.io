
function ElementPointerObserver(element, ...args) {
    ElementObserverBase.call(this, element, ...args);
    ElementPointerObserver.prototype.create.call(this);
}
ElementPointerObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementPointerObserver.prototype.constructor = ElementPointerObserver;

create_static_data_descriptors(ElementPointerObserver, ElementObserverBase);



// Implementation

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

ElementPointerObserver.prototype.create = function() {}
