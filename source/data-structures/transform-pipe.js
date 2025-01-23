
import { reduce_arrays } from '../algorithms/array-mods.js';
import IterableWeakSet from './iterable-weak-set.js';
import Mat, { mat, mat4 } from '../math/mat.js';

// This thing is awful and needs total rewriting, and update on get doesn't work

class Pipe {
    constructor(name, map, ...transforms) {
        this.name = name;
        this.need_update = false;
        this.combined = mat4().identity(4);
        this.list = [];
        this.map = map;
        this.add(transforms);
    }
}

Pipe.prototype.notify = function() {
    this.need_update = true;
};

Pipe.prototype.add = function(...transforms) {
    if (!transforms)
        return;
    transforms = reduce_arrays(transforms);
    for (const transform of transforms) {
        if (this.has(transform))
            throw new Error(`Pipe: ${transform} already is in ${this.name}`);
    }
    this.list.push(...transforms);
    this.notify();
};
Pipe.prototype.add_begin = function(...transforms) {
    if (!transforms)
        return;
    transforms = reduce_arrays(transforms);
    for (const transform of transforms) {
        if (this.has(transform))
            throw new Error(`Pipe: ${transform} already is in ${this.name}`);
    }
    this.list.unshift(...transforms);
    this.notify();
};

Pipe.prototype.add_after = function(target, ...transforms) {
    const index = this.list.indexOf(target);
    transforms = reduce_arrays(transforms);
    for (const transform of transforms) {
        if (this.has(transform))
            throw new Error(`Pipe: ${transform} already is in ${this.name}`);
    }
    if (index !== -1) {
        this.list.splice(index + 1, 0, ...reduce_arrays(transforms));
    } else {
        throw new Error(`Pipe: ${target} not found in ${this.name}`);
    }
    this.notify();
};

Pipe.prototype.remove = function(...transforms) {
    if (!transforms)
        return;
    transforms = reduce_arrays(transforms);
    this.list = this.list.filter(t => !transforms.includes(t));
    this.notify();
};

Pipe.prototype.update = function() {
    // If transform from TransfomrPipe is accessed no update flag is set, so any get will cause full recalc
    //if (!this.need_update)
    //    return;
    if (!this.list.length)
        return;
    if (!this.map.has(this.list[this.list.length-1]))
        throw new Error(`Pipe: ${this.list[this.list.length-1]} transform not found in ${this.name}`);
    const last = this.map.get(this.list[this.list.length-1]).transform;
    if (this.combined.dim_h != last.dim_h || this.combined.dim_v != last.dim_v)
        this.combined = mat(last.dim_v, last.dim_h);
    this.combined.assign(last);
    for (let i = this.list.length - 2; i >= 0; --i) {
        if (!this.map.has(this.list[i]))
            throw new Error(`Pipe: ${this.list[i]} transform not found in ${this.name}`);
        this.combined.mul_inplace(this.map.get(this.list[i]).transform);
    }
    this.need_update = false;
};

Object.defineProperty(Pipe.prototype, 'value', {
    get() { this.update(); return this.combined; }
});

Pipe.prototype.has = function(name) {
    return this.list.indexOf(name) != -1;
};

export default class TransformPipe {
    constructor() {
        this.transforms = new Map();
        this.pipes = new Map();
    }
}

TransformPipe.prototype.update_depenteds = function(name) {
    for (const pipe of this.transform.get(name).dependents)
        pipe.notify();
};

// Register a matrix by name
TransformPipe.prototype.add_transform = function(name, m) {
    if (typeof name !== 'string') {
        throw new Error('TransformPipe: invalid name');
    }
    if (!(m instanceof Mat)) {
        throw new Error('TransformPipe: invalid matrix');
    }
    if (this.transforms.has(name)) {
        throw new Error(`TransformPipe: transform '${name}' already exists`);
    }
    this.transforms.set(name, {transform: m, dependents: new IterableWeakSet()});
    Object.defineProperty(TransformPipe.prototype, name, {
        get() { return this.transforms.get(name).transform; },
        set(v) { this.transforms.get(name).transform = v; }
    });
};
TransformPipe.prototype.remove_transform = function(name) {
    if (typeof name !== 'string') {
        throw new Error('TransformPipe: invalid name');
    }
    if (!this.transforms.has(name)) {
        throw new Error(`TransformPipe: transform '${name}' doesn't exist`);
    }
    this.transforms.delete(name);
    for (const [, pipe] of this.pipes) {
        if (pipe.has(name))
            pipe.remove(name);
    }
    delete this[name];
};
TransformPipe.prototype.add_pipe = function(name, ...transforms) {
    if (typeof name !== 'string') {
        throw new Error('TransformPipe: invalid name');
    }
    if (this.pipes.has(name))
        throw new Error(`TransformPipe: ${name} pipe already exists`);
    transforms = reduce_arrays(transforms).filter((transform) => transform);
    for (const transform of transforms) {
        if (!this.transforms.has(transform))
            throw new Error(`TransformPipe: ${transform} doesn't exist`);
        this.transforms.get(transform).dependents.add(new String(name));
    }
    this.pipes.set(name, new Pipe(name, this.transforms, transforms));
    Object.defineProperty(TransformPipe.prototype, name, {
        get() { return this.pipes.get(name); }
    });
};
TransformPipe.prototype.remove_pipe = function(name) {
    if (!this.pipes.has(name))
        throw new Error(`TransformPipe: ${name} pipe doesn't exist`);
    for (const transform of this.pipes.list)
        this.transforms.get(transform).dependents.delete(name);
    this.pipes.delete(name);
    delete this[name];
};
