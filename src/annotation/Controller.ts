import { registry, RegistryScopeType } from '../core/Registry';

export function Controller(basePath?: string) {
  return (target) => {
    registry.set(target, 'scopeType', RegistryScopeType.singleton);
    registry.set(target, 'type', 'controller');

    if (basePath) {
      registry.set(target, 'basePath', basePath);
    }
  };
}