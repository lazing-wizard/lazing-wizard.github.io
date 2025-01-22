
import StyleManager from '../source/drawing/style/style-manager.js';

test('StyleManager: add', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop', 'val1'], ['prop2', 'val2']]);
    expect(manager.style1.prop).toBe('val1');
});

test('StyleManager: remove', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop', 'val1'], ['prop2', 'val2']]);
    manager.remove('style1');
    expect(manager.style1).toBe(undefined);
});

test('StyleManager: rename', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop', 'val1'], ['prop2', 'val2']]);
    manager.rename('style1', 'new_name');
    expect(manager.new_name.prop2).toBe('val2');
    expect(manager.style1).toBe(undefined);
});

test('StyleManager: copy', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop1', 'val1']]);
    manager.copy('style1', 'style2');
    manager.style1.prop1 = 'val3';
    manager.style2.prop1 = 'val4';
    expect(manager.style1.prop1).toBe('val3');
    expect(manager.style2.prop1).toBe('val4');
});

test('StyleManager: derive', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop1', 'val1']]);
    manager.derive('styled', 'style1', [['prop2', 'val2']]);

    expect(manager.styled.properties.has('prop1')).toBe(false);
    expect(manager.styled.prop1).toBe('val1');
    expect(manager.styled.prop2).toBe('val2');
});

test('StyleManager: cover', () => {
    const manager = new StyleManager();
    manager.add('style1', [['prop1', 'val1']]);
    const cover = manager.cover('style1', [['prop2', 'val2']]);

    expect(cover.prop1).toBe('val1');
    expect(cover.prop2).toBe('val2');
    expect(manager[cover.name]).toBe(undefined);
});
