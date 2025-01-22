
import Style from './style.js';

export default class StyleManager{ 
    constructor() { StyleManager.prototype.create.call(this); };
}

StyleManager.propert_not_found = Style.property_not_found;
StyleManager.property_conflit = Style.property_conflict;

StyleManager.prototype.add = function(style_name, properties, parent_name) {
    this.assert_not_exists(style_name);
    if (parent_name)
        this.assert_exists(parent_name);
    this[style_name] = new Style(style_name, properties, this[parent_name]);
};
StyleManager.prototype.remove = function(name) {
    this.assert_exists(name);
    delete this[name];
};

StyleManager.prototype.rename = function(old_name, new_name) {
    this.assert_exists(old_name);
    this.assert_not_exists(new_name);
    this[new_name] = this[old_name];
    this[new_name].set_name(new_name);
    this[old_name] = null;
    delete this[old_name];
};

StyleManager.prototype.copy = function(source_name, new_name) {
    this.assert_exists(source_name);
    this.assert_not_exists(new_name);
    this[new_name] = this[source_name].copy();
};

StyleManager.prototype.derive = function(child_name, parent_name, properties) {
    this.assert_not_exists(child_name);
    if (parent_name)
        this.assert_exists(parent_name);
    this[child_name] = new Style(child_name, properties, this[parent_name]);
};

StyleManager.prototype.cover = function(style_name, properties) {
    this.assert_exists(style_name);
    return new Style(`${style_name}_cover`, properties, this[style_name]);
};



// Implementation

StyleManager.prototype.create = function() {

};

StyleManager.prototype.assert_exists = function(name) {
    if (!(name in this))
        throw new Error(`StyleManager: style ${name} not found`);
};

StyleManager.prototype.assert_not_exists = function(name) {
    if (name in this)
        throw new Error(`StyleManager: style ${name} already exists`);
};
