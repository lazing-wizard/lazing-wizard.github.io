
// Proxy class between certain element and subscription on it's events
// Also stores previous states of events

// Invoked functions are names of the event with custom prependings to them
// Size event function is called 'onresize' and accepts single argument
// It's argument has several size related values like 'clientWidth' and 'offsetLeft'...
// It also has 'prev' subobject which has same properties for previous state of element
// It also has 'diff' subobject which stores difference of current and 'prev' state

function ElementObserver(element, delegate) { this.create(element, delegate); }

ElementObserver.prototype.observe = function(element, delegate) {
    this.delegate = delegate;
    if (delegate == null)
        this.delegate = element;
    if (this.element == element)
        return this;
    this.unobserve();
    this.delegate = delegate;
    if (delegate == null)
        this.delegate = element;
    this.element = element;
    this.attachListeners();
    return this;
}
ElementObserver.prototype.unobserve = function(element) {
    if (this.element) {
        this.delegate = null;
        this.detachListeners();
        this.element = null;
    }
    return this;
}

ElementObserver.prototype.setEventPrefix = function(prefix) {
    this.eventPrefix = prefix;
    return this;
}
ElementObserver.prototype.setEventPostfix = function(postfix) {
    this.eventPostfix = postfix;
    return this;
}



// Implementation

ElementObserver.prototype.create = function(element, delegate) { let observer = this;
    observer.element = null;
    observer.delegate = null;
    
    observer.eventPrefix = 'event';
    observer.eventPostfix = '';
    
    observer.createSizeVariables();
    observer.createMouseVariables();
    observer.createTouchVariables();
    
    if (element)
        this.observe(element, delegate)
}
ElementObserver.prototype.attachListeners = function() {
    if (this.element == null)
        throw new Error('Attach to null');
    
    this.attachSizeListener();
    this.attachMouseListeners();
    this.attachTouchListeners();
}
ElementObserver.prototype.detachListeners = function() { let observer = this;
    if (observer.element == null)
        throw new Error('Detach from null');
    
    this.detachSizeListener();
    this.detachMouseListeners();
    this.detachTouchListeners();
}

ElementObserver.prototype.constructName = function(event_type) {
    return this.eventPrefix + event_type + this.eventPostfix;
}

var __sizeobserverprops = ['clientWidth', 'clientHeight', 'clientLeft', 'clientTop',
                           'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop',
                           'width', 'height'];
ElementObserver.prototype.createSizeVariables = function() { let observer = this;
    observer.resizeObserver = null;
    observer.resize_event = {prev: {}, diff: {}, firstTime: true};
    __sizeobserverprops.forEach(function(property) {
        observer.resize_event.prev[property] = null;
        observer.resize_event[property] = null;
        observer.resize_event.diff[property] = null;
    });
}
ElementObserver.prototype.attachSizeListener = function() { let observer = this;
    __sizeobserverprops.forEach(function(property) {
        observer.resize_event.prev[property] = null;
        observer.resize_event[property] = observer.element[property];
        observer.resize_event.diff[property] = null;
    });
    observer.resize_event.prev['timeStamp'] = null;
    observer.resize_event['timeStamp'] = Date.now();
    observer.resize_event.diff['timeStamp'] = null;
    observer.resize_event.firstTime = true;
    observer.resizeObserver = new ResizeObserver(function() {
        if (observer.resize_event.firstTime) {
            __sizeobserverprops.forEach(function(property) {
                observer.resize_event.prev[property] = observer.element[property];
                observer.resize_event[property] = observer.element[property];
                observer.resize_event.diff[property] = 0;
            });
            observer.resize_event.prev['timeStamp'] = Date.now();
            observer.resize_event['timeStamp'] = observer.resize_event.prev['timeStamp'];
            observer.resize_event.diff['timeStamp'] = 0;
            observer.resize_event.firstTime = false;
        } else {
            __sizeobserverprops.forEach(function(property) {
                observer.resize_event.prev[property] = observer.resize_event[property];
                observer.resize_event[property] = observer.element[property];
                observer.resize_event.diff[property] = observer.resize_event[property] - observer.resize_event.prev[property];
            });
            observer.resize_event.prev['timeStamp'] = observer.resize_event['timeStamp'];
            observer.resize_event['timeStamp'] = Date.now();
            observer.resize_event.diff['timeStamp'] = observer.resize_event['timeStamp'] - observer.resize_event.prev['timeStamp'];
        }
        if (observer.delegate && observer.delegate[observer.constructName('resize')])
            observer.delegate[observer.constructName('resize')](observer.resize_event, observer.resize_event.prev, observer.resize_event.diff);
    });
    observer.resizeObserver.observe(observer.element);
}
ElementObserver.prototype.detachSizeListener = function() { let observer = this; 
    if (observer.resizeObserver) {
        observer.resizeObserver.unobserve(observer.element);
        observer.resize_event = {prev: {}, diff: {}, firstTime: true};
        observer.resizeObserver = null;
    }
}

var __mouseevents = ['click', 'dblclick', 'mousedown', 'mouseup',
                     'mousemove', 'mouseover', 'mouseout', 
                     'wheel'];                   
var __mousesavedprops = ['clientX', 'clientY', 'pageX', 'pageY',
                         'offsetX', 'offsetY', 'screenX', 'screenY',
                         'movementX', 'movementY',
                         'shiftKey', 'altKey', 'ctrlKey', 'metaKey',
                         'timeStamp'];
ElementObserver.prototype.createMouseVariables = function() { let observer = this;
    __mouseevents.forEach(function(event_type) {
        observer[event_type] = {prev: {}, diff: {}, firstTime: true};
        observer[event_type+'Listener'] = null;
    });
}
ElementObserver.prototype.attachMouseListeners = function() {  let observer = this;
    __mouseevents.forEach(function(event_type) {
        observer[event_type] = {prev: {}, diff: {}, firstTime: true};
        observer[event_type+'Listener'] = function(event) {
            if (observer[event_type].firstReport) {
                __mousesavedprops.forEach(function(property) {
                    observer[event_type].diff[property] = 0;
                    observer[event_type].prev[property] = event[property];
                });
                observer[event_type].firstReport = false;
            } else {
                __mousesavedprops.forEach(function(property) {
                    observer[event_type].diff[property] = event[property] - observer[event_type].prev[property];
                });
            }
            if (observer.delegate && observer.delegate[observer.constructName(event_type)])
                observer.delegate[observer.constructName(event_type)](event, observer[event_type].prev, observer[event_type].diff);
            __mousesavedprops.forEach(function(property) {
               observer[event_type].prev[property] = event[property];
            });
        }
       observer.element.addEventListener(event_type, observer[event_type+'Listener']);
    });
}
ElementObserver.prototype.detachMouseListeners = function() { let observer = this;
    __mouseevents.forEach(function(event_type) {
        if (observer[event_type+'Listener']) {
            observer.element.removeEventListener(event_type, observer[event_type+'Listener']);
            observer[event_type+'Listener'] = null;
            observer[event_type] = {prev: {}, diff: {}, firstTime: true};
        }
    });
}

/// Do touch events
var __touchevents = ['touchstart', 'touchmove', 'touchend'];
var __touchsavedprops = ['clientX', 'clientY', 'pageX', 'pageY',
                         'offsetX', 'offsetY', 'screenX', 'screenY',
                         'movementX', 'movementY',
                         'shiftKey', 'altKey', 'ctrlKey', 'metaKey',
                         'timeStamp'];
ElementObserver.prototype.createTouchVariables = function() { let observer = this;
    __touchevents.forEach(function(event_type) {
        observer['on'+event_type] = function(){};
        observer[event_type+'Listener'] = null;
    });
}
ElementObserver.prototype.attachTouchListeners = function() {  let observer = this;
    __touchevents.forEach(function(event_type) {
        observer[event_type+'Listener'] = function(event) {
            observer['on'+event_type](event);
        }
       observer.element.addEventListener(event_type, observer[event_type+'Listener'], {passive: false});
    });
}
ElementObserver.prototype.detachTouchListeners = function() { let observer = this;
    __touchevents.forEach(function(event_type) {
        if (observer[event_type+'Listener']) {
            observer.element.removeEventListener(event_type, observer[event_type+'Listener']);
            observer[event_type+'Listener'] = null;
        }
    });
}