import { registry } from '../core/Registry';

export function Autowired() {
  return (target, property: string) => {
    const type = Reflect.getMetadata('design:type', target, property);
    const data = {};
    data[property] = type;
    registry.add(target.constructor, 'autowired', data);
  };
}