import { registry } from '../core/Registry';

export function On(event: string, priority: number = 999999999) {
  return (target, property: string) => {
    const data = {};
    data[property] = [event, priority];
    registry.add(target.constructor, 'on', data);
  };
}