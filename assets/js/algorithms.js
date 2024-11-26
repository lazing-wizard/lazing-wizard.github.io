
// In place array modifiers

function append_unique_to(target, ...elements) {
    for (const new_element of elements) {
        if (!target.includes(new_element)) {
            target.push(new_element);
        }
    }
}

function append_unique_to_begin(target, ...elements) {
    for (const new_element of elements) {
        if (!target.includes(new_element)) {
            target.unshift(new_element);
        }
    }
}

function remove_elements_from(target, ...elements) {
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



function array_contains(target, element) {
    return target.find((target_element) => target_element == element);
}



function array_intersection(target1, target2) {
    return target1.filter((element) => array_contains(target2, element));
}

function array_union(target1, target2) {
    return [...target1, ...target2.filter((element) => !array_contains(target1, element))];
}

function array_subtraction(target1, target2) {
    return target1.filter((element) => !array_contains(target2, element));
}

function array_complement(target1, target2) {
    return target2.filter((element) => !array_contains(target1, element));
}


function reduce_arrays(...elements) {
    let out = [];
    function _reduce_arrays(out, ...elements) {
        for (let element of elements) {
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
