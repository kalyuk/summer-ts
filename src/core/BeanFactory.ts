import { Application } from '../Application';
import { isCyclic } from '../util/fn';
import { registry, RegistryScopeType } from './Registry';
import { defaultsDeep } from 'lodash';

export class BeanFactory {

  private beanCache: Map<number, any> = new Map<number, any>();
  private overwritedMap: Map<number, number> = new Map<number, number>();

  constructor(private appContext: Application) {
  }

  public init() {
    registry.getTargetsBy('scopeType', RegistryScopeType.singleton)
      .map((target) => this.getBean(target));
  }

  public setBean(oldClass, newClass) {
    const oldIndex = registry.register(oldClass);
    const newIndex = registry.register(newClass);
    this.overwritedMap.set(oldIndex, newIndex);
  }

  public getBean = <T>(baseTarget: (new(...args) => T)) => {
    if (!baseTarget
      || baseTarget.name === 'Object'
      || baseTarget.name === 'Boolean'
      || baseTarget.name === 'String'
      || baseTarget.name === 'Number'
    ) {
      return void(0);
    }

    const baseIndex = registry.getIndex(baseTarget);
    const index = this.overwritedMap.has(baseIndex) ? this.overwritedMap.get(baseIndex) : baseIndex;
    const target = index === baseIndex ? baseTarget : registry.getByIndex(index);
    const props = this.getFullProps(target);

    if (props.scopeType === RegistryScopeType.singleton && this.beanCache.has(index)) {
      return this.beanCache.get(index);
    }
    if (typeof target === 'function' && /^(?:class\s+|function\s+(?:_class|_default))/.test(target.toString())) {
      const params = (Reflect.getMetadata('design:paramtypes', target) || [])
        .map((param) => param ? this.getBean(param) : void(0));

      const appContext = this.appContext;

      // tslint:disable-next-line
      const Instance = class extends target {
        public getAppContext() {
          return appContext;
        }
      };

      if (isCyclic(Instance)) {
        throw new Error(`${Instance.name} have cyclic deps`);
      }

      const instance = new Instance(...params);

      if (props.scopeType === RegistryScopeType.singleton && props.on) {
        Object.keys(props.on)
          .forEach((property) => {
            const [event, priority] = props.on[property];
            this.appContext.on(event, instance[property].bind(instance), priority);
          });
      }

      if (props.scopeType === RegistryScopeType.singleton) {
        this.beanCache.set(index, instance);
      }

      return instance;
    }

    return null;
  }

  private getFullProps(constructor) {
    let props = registry.get(constructor) || {};
    if (constructor.__proto__.name) {
      props = defaultsDeep(props, this.getFullProps(constructor.__proto__));
    }
    return props;
  }
}
