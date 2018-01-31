import { registry, RegistryScopeType } from '../core/Registry';

export function Provider(scopeType: RegistryScopeType = RegistryScopeType.singleton) {
  return (target) => {
    registry.set(target, 'scopeType', scopeType);
    registry.set(target, 'type', 'provider');
  };
}