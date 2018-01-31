import * as assert from 'assert';
import { Registry } from '../../src/core/Registry';

describe('Registry', () => {
  let registry: Registry = null;

  class Test {
  }

  beforeEach(() => {
    registry = new Registry();
  });

  it('should be set and get property', () => {
    const value = 1;
    registry.set(Test, 'property', value);
    assert.equal(value, registry.get(Test, 'property'));
  });

  it('should be return false if didn`t set propery', function () {
    const result = registry.get(Test, 'property');
    assert.equal(false, result);
  });

  // it('should be set type property to array from undefined', function () {
  //   const value = 'value';
  //   registry.add(Test, 'property', value);
  //   const result = registry.get(Test, 'property');
  //
  //   assert(result instanceof Array);
  //   assert.equal(result[0], value);
  // });

  it('should be run Exception', function () {
    try {
      const value = 'value';
      registry.set(Test, 'property', value);
      registry.add(Test, 'property', 1);
      assert(false);
    } catch (e){

    }
  });

  // it('should be add and get property', () => {
  //   const value = 1;
  //   registry.add(Test, 'property', value);
  //   const result = registry.get(Test, 'property');
  //   assert.equal(1, result.length);
  //   assert.equal(value, result[0]);
  // });

  it('should be return targets by property value', () => {
    const value = 1;
    registry.set(Test, 'property', value);
    const targets = registry.getTargetsBy('property', value);
    assert.equal(1, targets.length);
    assert(new targets[0]() instanceof Test);
  });

  it('should be run Exception if pass array property', () => {
    try {
      const value = 1;
      registry.add(Test, 'property', value);
      registry.getTargetsBy('property', value);
      assert(false);
    } catch (e) {

    }
  });
});