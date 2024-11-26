
function ElementKeyboardObserver(...args) {
    ElementObserverBase.call(this, ...args);
    ElementKeyboardObserver.prototype.create.call(this);
}
ElementKeyboardObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementKeyboardObserver.prototype.constructor = ElementKeyboardObserver;

create_static_data_descriptors(ElementKeyboardObserver, ElementObserverBase);



// Implementation

ElementKeyboardObserver.all_keyword = 'keyboard_all';
ElementKeyboardObserver.supported_event_types = [
    'keydown', 'keyup', 'keypress'
];

ElementKeyboardObserver.instance_data_properties = ElementKeyboardObserver.supported_event_types.map((event_type) => {
    return `${event_type}_listener`;
});
create_instance_data_descriptors(ElementKeyboardObserver);

ElementKeyboardObserver.prototype.create = function() {}
