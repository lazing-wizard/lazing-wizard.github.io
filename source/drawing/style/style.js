
import { reduce_arrays } from '../../algorithms/array-mods.js';
import IterableWeakSet from '../../data-structures/iterable-weak-set.js';

export default class Style {
    constructor(...args) { Style.prototype.create.call(this, ...args); };
}

Style.prototype.set = function(property, value) {
    return this._set_properties(property, value);
};
Style.prototype.unset = function(property) {
    this.set(property, undefined);
};
Style.prototype.get = function(property) {
    if (!this.property_exists(property))
        throw new Error(`Style: property ${property} is not defined`);
    const value = this._get_property(property);
    if (value === Style.property_not_found) {
        return undefined;
    }
    return value;
};

Style.prototype.set_name = function(name) {
    this.style_name = name;
};
Style.prototype.get_name = function() {
    return this.style_name;
};
Style.prototype.get_chain = function() {
    return this.style_name + (this.parent_style? ` -> ${this.parent_style.get_chain()}` : '');
};

Style.prototype.property_exists = function(property) {
    let parent_has_property = false;
    if (this.parent_style)
        parent_has_property = this.parent_style.property_exists(property);
    return (this.properties.has(property) || parent_has_property) && Object.prototype.hasOwnProperty.call(Style.prototype, property);
};

Style.prototype.add_properties = function(properties) {
    if (!properties)
        return;
    if (properties instanceof Array) {
        if (properties.length == 0)
            return;
        const element = properties[0];
        if (element instanceof Array) {
            this.add_property_pairs(properties);
        } else if (typeof element !== 'object') {
            this.add_property_list(properties);
        } else {
            this.add_property_details(properties);
        }
    } else if (typeof properties === 'object') {
        this.add_property_map(properties);
    } else {
        this._add_property(properties);
    }
};

Style.prototype.remove_properties = function(properties) {
    properties = reduce_arrays(properties).filter((property) => property);
    for (const property of properties) {
        if (this.property_exists(property)) {
            this.remove_property_from_relations(property);
            this.properties.delete(property);
        }
    }
    for (const child of this.children) {
        child.remove_properties(properties);
    }
};

Style.prototype.add_property_relations = function(parent_property, child_properties) {
    if (!(child_properties instanceof Set))
        child_properties = reduce_arrays(child_properties).filter((property) => property);
    if (!parent_property)
        return;
    if (child_properties instanceof Array && child_properties.length == 0)
        return;
    else if (child_properties instanceof Set && child_properties.size == 0)
        return;
    if (!this.property_exists(parent_property)) {
        throw new Error(`Style: property ${parent_property} is not defined`);
    }
    if (!this.composites.has(parent_property)) {
        this.composites.set(parent_property, new Set());
    }
    const parent_entry = this.composites.get(parent_property);
    for (const child_property of child_properties) {
        if (!this.property_exists(child_property)) {
            throw new Error(`Style: property ${child_property} is not defined`);
        }
        if (parent_entry.has(child_property))
            throw new Error(`Style: relation ${parent_property} -> ${child_property} is already defined`);
        parent_entry.add(child_property);
    }
    for (const child of this.children) {
        child.add_property_relations(parent_property, child_properties);
    }
};

// Deletes properties as pair
Style.prototype.remove_property_relations = function(parent_property, child_properties) {
    if (child_properties) {
        if (!(child_properties instanceof Set))
            child_properties = reduce_arrays(child_properties).filter((property) => property);
        if (this.composites.has(parent_property)) {
            const entry = this.composites.get(parent_property);
            for (const child_property of child_properties) {
                entry.delete(child_property);
            }
            if (entry.size == 0)
                this.composites.delete(parent_property);
        }
    }
    for (const child of this.children) {
        child.remove_property_relations(parent_property, child_properties);
    }
};

// Deletes properties from each side
Style.prototype.remove_property_from_relations = function(property) {
    const properties = reduce_arrays(property);
    for (const property of properties) {
        this.composites.delete(property);
        const empty_entries = [];
        for (const [parent_property, child_properties] of this.composites) {
            child_properties.delete(property);
            if (child_properties.size == 0)
                empty_entries.push(parent_property);
        }
        for (const empty_entry of empty_entries) {
            this.composites.delete(empty_entry);
        }
    }
    for (const child of this.children) {
        child.remove_property_from_relations(property);
    }
};

Style.prototype.set_parent_style = function(parent_style) {
    if (this.parent_style)
        this.remove_parent_style();
    this.parent_style = parent_style;
    this.parent_style.children.add(this);
    for (const [parent_property, child_properties] of this.parent_style.composites) {
        this.add_property_relations(parent_property, child_properties);
    }
    for (const child of this.children) {
        child.set_parent_style(this);
    }
};
Style.prototype.remove_parent_style = function() {
    if (!this.parent_style)
        return;
    for (const [parent_property, child_properties] of this.parent_style.composites) {
        this.remove_property_relations(parent_property, child_properties);
        for (const child of this.children) {
            child.remove_property_relations(parent_property, child_properties);
        }
    }
    this.parent_style.children.delete(this);
    this.parent_style = null;
};



// Implementation

Style.prototype.create = function(name, properties, parent_style) {
    this.style_name = name;
    this.properties = new Map();
    this.composites = new Map();
    this.parent_style = null;
    this.children = new IterableWeakSet();
    if (parent_style !== undefined) {  
        if (!(parent_style instanceof Style)) {
            throw new Error('Style: parent_style must be a Style object or undefined');
        } else {
            this.set_parent_style(parent_style);
        }
    }
    this.add_properties(properties);
};

class PropertyNotFound {}
Style.property_not_found = new PropertyNotFound();
class PropertyConflict {}
Style.property_conflict = new PropertyConflict();
Style.prototype._get_property = function(property) {
    let value;
    if (!this.properties.has(property)) {
        value = Style.property_not_found;
    } else {
        value = this.properties.get(property);
    }
    if (this.composites.has(property)) {
        for (const child_property of this.composites.get(property)) {
            const child_value = this._get_property(child_property);
            if (child_value != value) {
                value = Style.property_conflict;
                break;
            }
        }
    }
    if (value === Style.property_not_found && this.parent_style !== null) {
        value = this.parent_style._get_property(property);
    }
    return value;
};

Style.prototype._add_property = function(property, value) {
    //if (this.property_exists(property))
    //    throw new Error(`Style: property ${property} is already defined`);
    this.properties.set(property, value);
    if (!Object.prototype.hasOwnProperty.call(Style.prototype, property))
        Object.defineProperty(Style.prototype, property, {
            get() { return this.get(property); },
            set(value) { this.set(property, value); }
        });
};

Style.prototype._set_properties = function(property, value) {
    if (property instanceof Array) {
        for (const [arr_property, arr_value] of property) {
            if (!this.property_exists(arr_property))
                throw new Error(`Style: property ${arr_property} is not defined`);
            this._set_property(arr_property, arr_value);
        }
    } else if (!(property instanceof Object)) {
        if (!this.property_exists(property))
            throw new Error(`Style: property ${property} is not defined`);
        this._set_property(property, value);
    } else {
        for (var arr_property in property) {
            this._set_property(property, arr_property[property]);
        }
    }
};

Style.prototype._set_property = function(property, value) {
    this.properties.set(property, value);
    if (this.composites.has(property)) {
        for (const arr_property of this.composites.get(property)) {
            this._set_property(arr_property, value);
        }
    }
};

Style.prototype.add_property_list = function(properties) {
    for (const property of properties) {
        this._add_property(property);
    }
};
Style.prototype.add_property_pairs = function(properties) {
    for (const [property, value] of properties) {
        this._add_property(property, value);
    }
};
Style.prototype.add_property_map = function(properties) {
    for (var property in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, property)) {
            this._add_property(property, properties[property]);
        }
    }
};
Style.prototype.add_property_details = function(properties) {
    for (const {property, value} of properties) {
        this._add_property(property, value);
    }
    for (const {property, parent, children} of properties) {
        this.add_property_relations(property, children);
        this.add_property_relations(parent, property);
    }
};

Style.prototype.copy = function() {
    const style = new Style();
    style.set_name(this.style_name);
    style.properties = new Map(this.properties);
    style.composites = new Map(this.composites);
    style.parent_style = this.parent_style;
    style.children = new Set();
    style.children = this.children.copy();
    return style;
};
