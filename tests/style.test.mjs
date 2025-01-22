
import Style from '../source/drawing/style/style.js';

test('Style: add properties as list', () => {
    const style = new Style('test', ['prop', 'prop2']);
    expect(style.properties.has('prop')).toBe(true);
    expect(style.prop).toBe(undefined);
    expect(style.properties.has('prop2')).toBe(true);
    expect(style.prop2).toBe(undefined);

    style.prop = 'val';
    expect(style.prop).toBe('val');
});

test('Style: add properties as pairs', () => {
    const style = new Style('test', [['prop', 'val'], ['prop2', 'val2']]);
    expect(style.properties.has('prop')).toBe(true);
    expect(style.properties.has('val')).toBe(false);
    expect(style.prop).toBe('val');
    expect(style.prop2).toBe('val2');

    style.prop = 'val3';
    expect(style.prop).toBe('val3');
});

test('Style: add properties as object (map)', () => {
    const style = new Style('test', {prop: 'val', 'prop2': 'val2'});
    expect(style.properties.has('prop')).toBe(true);
    expect(style.properties.has('val')).toBe(false);
    expect(style.prop).toBe('val');
    expect(style.prop2).toBe('val2');

    style.prop = 'val3';
    expect(style.prop).toBe('val3');
});

test('Style: add properties as detailed', () => {
    const style = new Style('test', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', children: ['prop']}]);
    expect(style.properties.has('prop')).toBe(true);
    expect(style.properties.has('prop2')).toBe(true);
    expect(style.properties.has('prop3')).toBe(true);
    expect(style.prop2).toBe('val2');
    expect(style.composites.has('prop')).toBe(true);
    expect(style.composites.get('prop').has('prop2')).toBe(true);
    expect(style.composites.has('prop3')).toBe(true);
    expect(style.composites.get('prop3').has('prop')).toBe(true);
    
});

test('Style: add property as one arg', () => {
    const style = new Style('test', 'prop');
    expect(style.properties.has('prop')).toBe(true);
});

test('Style: property exists test', () => {
    const style = new Style('test', ['prop', 'prop2']);
    expect(style.property_exists('prop')).toBe(true);
    expect(style.property_exists('prop3')).toBe(false);
});

test('Style: transitive property exists test', () => {
    const style = new Style('test', ['prop', 'prop2']);
    const style2 = new Style('test2', null, style);

    expect(style2.property_exists('prop')).toBe(true);
});

test('Style: composite properties transitiveness', () => {
    const style = new Style('test', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);

    // prop3 -> prop -> prop2
    style.prop = 'val3';
    expect(style.prop2).toBe('val3');
    expect(style.prop).toBe('val3');
    expect(style.properties.get('prop3')).toBe('val5');

    style.prop3 = 'val6';
    expect(style.properties.get('prop2')).toBe('val6');
    expect(style.prop).toBe('val6');
    expect(style.properties.get('prop3')).toBe('val6');
});

test('Style: composite properties breaks on values conflict', () => {
    const style = new Style('test', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);
    
    style.prop = 'val4';
    expect(style.prop2).toBe('val4');
    expect(style.prop3).toBe(Style.property_conflict);
});

test('Style: parent property lookup', () => {
    const parent_style = new Style('test1', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop3'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);
    
    const child_style = new Style('test2', null, parent_style);
    
    expect(child_style.properties.has('prop2')).toBe(false);
    expect(child_style.prop2).toBe('val2');
});

test('Style: add property relation', () => {
    const style = new Style('test1', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);
    style.add_properties(['prop4', 'val4']);
    style.add_property_relations('prop', 'prop4');
    expect(style.composites.get('prop').has('prop2')).toBe(true);
    expect(style.composites.get('prop').has('prop4')).toBe(true);
    expect(style.composites.get('prop3').has('prop')).toBe(true);
    expect(style.composites.get('prop').size).toBe(2);
    expect(style.composites.get('prop3').size).toBe(1);
});

// If parent has certain combined property, children have to record this as well
test('Style: set property composite transitive', () => {
    const style = new Style('test1', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);
    const style2 = new Style('test2', null, style);

    style.prop3 = 'val';
    expect(style.prop3).toBe('val');
    expect(style.prop2).toBe('val');
    expect(style.prop).toBe('val');

    style2.prop3 = 'val10';

    expect(style2.prop3).toBe('val10');
    expect(style2.prop2).toBe('val10');
    expect(style2.prop).toBe('val10');
});

test('Style: get property composite transitive', () => {
    const style = new Style('test1', [
        {property: 'prop'},
        {property: 'prop2', value: 'val2', parent: 'prop'},
        {property: 'prop3', value: 'val5', children: ['prop']}]);
    const style2 = new Style('test2', null, style);

    style.prop3 = 'val';
    expect(style.prop3).toBe('val');
    expect(style.prop2).toBe('val');
    expect(style.prop).toBe('val');
    
    style.prop2 = 'val7';
    
    expect(style2.prop3).toBe(Style.property_conflict);

    expect(style2.composites.has('prop3')).toBe(true);
    expect(style2.composites.get('prop3').has('prop')).toBe(true);
});

test('Style: children recording', () => {
    const style = new Style('test1', [
        {property: 'prop', value: 'val'},
        {property: 'prop2', value: 'val', parent: 'prop'},
        {property: 'prop3', value: 'val', parent: 'prop'}]);
    const style2 = new Style('test2', null, style);
    const style3 = new Style('test3', null, style);

    expect(style.children.has(style2)).toBe(true);
    expect(style.children.has(style3)).toBe(true);
});

test('Style: property pair removal affects children', () => {
    const style = new Style('test1', [
        {property: 'prop', value: 'val'},
        {property: 'prop2', value: 'val', parent: 'prop'},
        {property: 'prop3', value: 'val', parent: 'prop'}]);
    const style2 = new Style('test2', null, style);
    style2.prop = 'val1';

    expect(style.prop).toBe('val');
    expect(style.prop2).toBe('val');
    expect(style2.prop).toBe('val1');
    expect(style2.prop2).toBe('val1');

    style.remove_property_relations('prop', 'prop2');

    expect(style.composites.has('prop')).toBe(true);
    expect(style2.composites.has('prop')).toBe(true);

    expect(style.composites.get('prop').has('prop2')).toBe(false);
    expect(style2.composites.get('prop').has('prop2')).toBe(false);
    expect(style.composites.get('prop').has('prop3')).toBe(true);
    expect(style2.composites.get('prop').has('prop3')).toBe(true);

    style.remove_property_relations('prop', 'prop3');

    expect(style.composites.has('prop')).toBe(false);
    expect(style2.composites.has('prop')).toBe(false);
});

test('Style: property removal affects children', () => {
    const style = new Style('test1', [
        {property: 'prop', value: 'val'},
        {property: 'prop2', value: 'val', parent: 'prop'},
        {property: 'prop3', value: 'val', parent: 'prop'},
        {property: 'prop4', value: 'val', parent: 'prop2'},
        {property: 'prop5', value: 'val', parent: 'prop3'}]);
    const style2 = new Style('test2', null, style);
    style2.prop = 'val1';

    style.remove_property_from_relations('prop5');

    expect(style.composites.has('prop3')).toBe(false);
    expect(style2.composites.has('prop3')).toBe(false);

    style.remove_property_from_relations('prop2');

    expect(style.composites.has('prop2')).toBe(false);
    expect(style2.composites.has('prop2')).toBe(false);

    expect(style.composites.has('prop')).toBe(true);
    expect(style2.composites.has('prop')).toBe(true);

    expect(style.composites.get('prop').has('prop2')).toBe(false);
    expect(style2.composites.get('prop').has('prop2')).toBe(false);
});

test('Style: removing parents removes relations', () => {
    const style = new Style('test1', [
        {property: 'prop', value: 'val'},
        {property: 'prop2', value: 'val', parent: 'prop'}]);
    
    const style2 = new Style('test2', [
        {property: 'prop3', value: 'val2'},
        {property: 'prop4', value: 'val2', parent: 'prop3'}], style);
    
    expect(style2.composites.has('prop')).toBe(true);
    expect(style2.composites.has('prop2')).toBe(false);
    expect(style2.composites.has('prop3')).toBe(true);
    expect(style2.composites.has('prop4')).toBe(false);
    
    style2.remove_parent_style();

    expect(style2.composites.has('prop')).toBe(false);
});

test('Style: removing whole properties', () => {
    const style = new Style('test1', [
        {property: 'prop', value: 'val'},
        {property: 'prop2', value: 'val', parent: 'prop'}]);
    
    const style2 = new Style('test2', [
        {property: 'prop3', value: 'val2'},
        {property: 'prop4', value: 'val2', parent: 'prop3'}], style);

    style.remove_properties('prop');
    
    expect(style2.properties.has('prop')).toBe(false);
    expect(style2.composites.has('prop')).toBe(false);
    expect(style.properties.has('prop')).toBe(false);
    expect(style.composites.has('prop')).toBe(false);
    
    style.remove_properties('prop4');
    
    expect(style2.properties.has('prop4')).toBe(false);
    expect(style.properties.has('prop4')).toBe(false);
    expect(style2.composites.has('prop3')).toBe(false);
    expect(style.composites.has('prop3')).toBe(false);
});
