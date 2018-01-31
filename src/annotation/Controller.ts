import { registry, RegistryScopeType } from '../core/Registry';

export function Controller(name?: string, basePath?: string) {
  return (target) => {
    registry.set(target, 'scopeType', RegistryScopeType.singleton);
    registry.set(target, 'type', 'controller');

    if (name) {
      registry.set(target, 'name', name);
    }

    if (basePath) {
      registry.set(target, 'basePath', basePath);
    }
  };
}