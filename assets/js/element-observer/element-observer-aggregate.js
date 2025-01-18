
// Proxy class between certain element and subscription on it's events

// Invoked functions are names of the event with custom prependings to them
// Size event function is called 'onresize' and accepts single argument

// Takes ElementObserverBase methods as interface and delegates
// them to all handlers that are it's subclasses

import { create_instance_data_descriptors } from '../algorithms/prototype-mods.js';
import { create_static_data_descriptors } from '../algorithms/prototype-mods.js';

import { array_union } from '../algorithms/array-mods.js';

import ElementObserverBase from './element-observer-base.js';
import ElementKeyboardObserver from './element-observer-keyboard.js';
import ElementMouseObserver from './element-observer-mouse.js';
import ElementPointerObserver from './element-observer-pointer.js';
import ElementResizeObserver from './element-observer-resize.js';
import ElementTouchObserver from './element-observer-touch.js';

export default class ElementObserver {
    constructor(...args) { this.create(...args); };
    static static_data_properties = ['handler_types', 'supported_event_types'];
    static instance_data_properties = ['handlers'];
}
create_static_data_descriptors(ElementObserver);
create_instance_data_descriptors(ElementObserver);
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

ElementObserver.prototype.create = function(...args) {
    this.handlers = [];
    this.handler_types.forEach(handler => {
        this.handlers.push(new handler(...args));
    });
};

ElementObserver.prototype.attach_listeners = function() { throw new Error('Not for calling'); };
ElementObserver.prototype.detach_listeners = function() { throw new Error('Not for calling'); };
ElementObserver.prototype.attach_listener = function() { throw new Error('Not for calling'); };
ElementObserver.prototype.detach_listener = function() { throw new Error('Not for calling'); };

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
        };
    }
});
