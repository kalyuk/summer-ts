import { registry } from '../core/Registry';

export function Value(key: string, defaultValue: any) {
  return (target, property: string) => {
    const data = {};
    data[property] = [key, defaultValue];
    registry.add(target.constructor, 'value', data);
  };
}