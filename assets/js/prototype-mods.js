
// These functions need to work with inheritance as if with decorators to achieve static dispatching behaviour

// Makes possible to refer static members from the class name and from instance
function create_static_data_descriptors(target_class, parent_class) {
    const properties = reduce_arrays(target_class.static_data_properties).filter((property) => property);
    for (const property of properties) {
        // Define property to get static member from class instance
        Object.defineProperty(target_class.prototype, property, {
            get() { return target_class['_' + property]; },
            set(v) { target_class['_' + property] = v; }
        });
        // Define property to get static member from class directly (not constructor)
        Object.defineProperty(target_class, property, {
            get() { return target_class['_' + property]; },
            set(v) { target_class['_' + property] = v; }
        });
    }
    // Define property to get parent static member as copy on derived class if it was not redefined
    if (!parent_class)
        return;
    const parent_properties = reduce_arrays(parent_class.static_data_properties).filter((property) => property);
    const inherited_properties = array_subtraction(parent_properties, properties);
    if (!inherited_properties.length)
        return;
    if (!(target_class.static_data_properties instanceof Array))
        target_class.static_data_properties = [];
    for (const property of inherited_properties) {
        target_class.static_data_properties.push(property);
        /// Do copy
        target_class['_' + property] = JSON.parse(JSON.stringify(parent_class['_' + property]));
        Object.defineProperty(target_class.prototype, property, {
            get() { return target_class['_' + property]; },
            set(v) { target_class['_' + property] = v; }
        });
        Object.defineProperty(target_class, property, {
            get() { return target_class['_' + property]; },
            set(v) { target_class['_' + property] = v; }
        });
    }
}
// Makes possible to discover members for decorator
function create_instance_data_descriptors(target_class) {
    const properties = reduce_arrays(target_class.instance_data_properties).filter((property) => property);
    for (const property of properties) {
        Object.defineProperty(target_class.prototype, property, {
            get() { return this['_' + property]; },
            set(v) { this['_' + property] = v; }
        });
    }
}

// Copies undefined methods and data properties from decorated class to decorator
function delegate_undefined_descriptors(decorated_class, decorator_class, delegate_name) {
    const decorated_descriptors = Object.entries(Object.getOwnPropertyDescriptors(decorated_class.prototype));
    const decorator_descriptors = Object.entries(Object.getOwnPropertyDescriptors(decorator_class.prototype));

    for(const [decorator_property, decorator_descriptor] of decorator_descriptors) {
        if (!decorated_descriptors.find((decorated_descriptor) => decorated_descriptor[0] == decorator_property)) {
            if (decorator_descriptor.value) {
                decorated_class.prototype[decorator_property] = function(...args) {
                    return this[delegate_name][decorator_property](...args);
                }
            } else if (decorator_descriptor.get || decorator_descriptor.set) {
                Object.defineProperty(decorated_class.prototype, decorator_property, {
                    get() {
                        return this[delegate_name][decorator_property];
                    },
                    set(v) {
                        this[delegate_name][decorator_property] = v;
                    }
                });
            }
        }

    }
}
