
function ElementKeyboardObserver(element, ...args) { ElementObserverBase.call(this, element, ...args); this.create(); }
ElementKeyboardObserver.prototype = Object.create(ElementObserverBase.prototype);
ElementKeyboardObserver.prototype.constructor = ElementKeyboardObserver;

ElementKeyboardObserver.all_keyword = 'keyboard_all';
ElementKeyboardObserver.supported_event_types = [
    'keydown', 'keyup', 'keypress'
];

ElementKeyboardObserver.prototype.create = function() {
    
}
