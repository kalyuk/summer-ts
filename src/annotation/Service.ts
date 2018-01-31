import { registry, RegistryScopeType } from '../core/Registry';

export function Service(scopeType: RegistryScopeType = RegistryScopeType.singleton) {
  return (target) => {
    registry.set(target, 'scopeType', scopeType);
    registry.set(target, 'type', 'service');
  };
}