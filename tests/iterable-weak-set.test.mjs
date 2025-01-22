
import IterableWeakSet from '../source/data-structures/iterable-weak-set.js';

class MockWeakRef {
    constructor(value) {
        this.value = value;
    }
    deref() {
        return this.value;
    }
}

test('IterableWeakSet', () => {
    const values = [1, undefined, 2];
    const set = new IterableWeakSet();
    for (const value of values) {
        set.set.add(new MockWeakRef(value));
    }
    const returned_values = [];
    for (const value of set) {
        returned_values.push(value);
    }
    expect(returned_values[0]).toBe(1);
    expect(returned_values[1]).toBe(2);
});
