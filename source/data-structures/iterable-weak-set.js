
export default class IterableWeakSet {
    constructor(...args) {
        this.set = new Set();
        for (const arg of args) {
            this.add(arg);
        }
    }
    add(value) {
        this.set.add(new WeakRef(value));
    }
    delete(value) {
        let target = null;
        for (const ref of this.set) {
            if (ref.deref() == value) {
                target = ref;
                break;
            }
        }
        if (target) {
            this.set.delete(target);
        }
    }
    has(value) {
        for (const ref of this.set) {
            if (ref.deref() === value)
                return true;
        }
        return false;
    }
    copy() {
        const result = new IterableWeakSet();
        for (const ref of this.set) {
            const value = ref.deref();
            if (value) {
                result.add(value);
            }
        }
        return result;
    }
    [Symbol.iterator]() {
        const null_references = [];
        const it = this.set[Symbol.iterator]();
        return {
            next: () => {
                let next = it.next();
                while (!next.done && next.value.deref() === undefined) {
                    null_references.push(next.value);
                    next = it.next();
                }
                const value = next.value ? next.value.deref() : undefined;
                if (value) {
                    return { value: value, done: false };
                } else {
                    for (const ref of null_references)
                        this.set.delete(ref);
                    return { value: undefined, done: true };
                }
            }
        }; 
    } 
}