
import { mat2 } from '../source/math/mat.js';
import TransformPipe from '../source/data-structures/transform-pipe';

test('TransformPipe', () => {
    const transform = new TransformPipe();

    transform.add_transform('transform1', mat2(2, 0, 0, 2));
    transform.add_transform('transform2', mat2(5, 0, 0, 5));
    transform.add_transform('transform3', mat2(3, 0, 0, 3));

    expect(transform.transform1.data[0]).toBe(2);

    transform.add_pipe('pipe1', 'transform1', 'transform3');
    transform.add_pipe('pipe2', 'transform3');
    transform.add_pipe('pipe3', 'transform2', 'transform3');

    expect(transform.pipe1.value.compare(mat2(6, 0, 0, 6))).toBe(true);
    expect(transform.pipe2.value.compare(mat2(3, 0, 0, 3))).toBe(true);
    expect(transform.pipe3.value.compare(mat2(15, 0, 0, 15))).toBe(true);
});
