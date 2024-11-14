
// These functions need to work with inheritance as if with decorators to achieve static dispatching behaviour

// Copies methods to child with accessing them from parent stored object if it was not redefined

function inherit_undefined_methods(parent_class, child_class, delegate_name) {
    //child_class.prototype.delegate_name = delegate_name;

    const child_methods = Object.getOwnPropertyNames(child_class.prototype)
        .filter((method) => typeof child_class.prototype[method] === 'function');
    
    const parent_methods = Object.getOwnPropertyNames(parent_class.prototype)
        .filter((method) => typeof parent_class.prototype[method] === 'function');
 
    for(const parent_method of parent_methods) {
        if (!child_methods.find((child_method) => child_method == parent_method)) {
            /// I don't know what is better closures or eval

            //child_class.prototype[parent_method] = function(...args) {
            //    return this[this.delegate_name][parent_method](...args);
            //}
            eval(`
                child_class.prototype.${parent_method} = function(...args) {
                    return this.${delegate_name}.${parent_method}(...args);
                }
            `)
        }
    }
}

// Need to not call like plane.plane.x on decorated object and requires data_members static member
function generate_accessors(target_class) {
    const properties = Object.getOwnPropertyNames(target_class.prototype)
        .filter((method) => typeof target_class.prototype[method] === 'function');

    for (const data_member of target_class.data_members) {
        if (!properties.find((property) => property == 'get_' + data_member)) {
            //target_class.prototype['get_' + data_member] = function() {
            //    return this[data_member];
            //}
            eval(`
                target_class.prototype.${'get_' + data_member} = function() {
                    return this.${data_member};
                }
            `)
        }
        if (!properties.find((property) => property == 'set_' + data_member)) {
            //target_class.prototype['set_' + data_member] = function(arg) {
            //    this[data_member] = arg;
            //    return this;
            //}
            eval(`
                target_class.prototype.${'set_' + data_member} = function() {
                    this.${data_member} = arg;
                    return this;
                }
            `)
        }
    }
}