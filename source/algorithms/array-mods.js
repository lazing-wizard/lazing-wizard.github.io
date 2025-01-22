
// In place array modifiers

export function append_unique_to(target, ...elements) {
    for (const new_element of elements) {
        if (!target.includes(new_element)) {
            target.push(new_element);
        }
    }
}

export function append_unique_to_begin(target, ...elements) {
    for (const new_element of elements) {
        if (!target.includes(new_element)) {
            target.unshift(new_element);
        }
    }
}

export function remove_elements_from(target, ...elements) {
    let write = 0;
    for (let read = 0; read < target.length; ++read) {
        if (!elements.some(elem => elem === target[read])) {
            if (write !== read) {
                target[write] = target[read];
            }
            write++;
        }
    }
    target.length = write;
}



export function array_contains(target, element) {
    return target.find((target_element) => target_element == element);
}



export function array_intersection(target1, target2) {
    return target1.filter((element) => array_contains(target2, element));
}

export function array_union(target1, target2) {
    return [...target1, ...target2.filter((element) => !array_contains(target1, element))];
}

export function array_subtraction(target1, target2) {
    return target1.filter((element) => !array_contains(target2, element));
}

export function array_complement(target1, target2) {
    return target2.filter((element) => !array_contains(target1, element));
}


export function reduce_arrays(...elements) {
    const out = [];
    function _reduce_arrays(out, ...elements) {
        for (const element of elements) {
            if (element instanceof Array) {
                _reduce_arrays(out, ...element);
            } else {
                out.push(element);
            }
        }
    }
    _reduce_arrays(out, ...elements);
    return out;
}

export function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

export function priority_member_chose() {
    for (let i = 0; i < arguments.length; i+=2) {
        const object = arguments[i];
        const key = arguments[i+1];
        if (key in object) {
            return object[key];
        }
    }
}
