import 'reflect-metadata';

export enum RegistryScopeType {
  singleton = 'singleton',
  factory = 'factory'
}

export class Registry {
  private cache: any[] = [];
  private targets: any[] = [];

  public add(target, property: string, value) {
    this.create(target);
    const index = this.getIndex(target);
    const isArray = Array.isArray(value);
    if (!this.cache[index][property]) {
      this.cache[index][property] = isArray ? [] : {};
    } else if (typeof this.cache[index][property] !== 'object') {
      throw new Error('Value already set as not array');
    }
    if (isArray) {
      this.cache[index][property].push(value);
    } else {
      Object.assign(this.cache[index][property], value);
    }
  }

  public get(target, property?: string) {
    this.create(target);
    const index = this.getIndex(target);
    if (!property) {
      return this.cache[index];
    }
    return this.cache[index][property] || false;
  }

  public register(target) {
    this.create(target);
    return this.getIndex(target);
  }

  public set(target, property: string, value) {
    this.create(target);
    const index = this.getIndex(target);
    this.cache[index][property] = value;
  }

  public getTargetsBy(property: string, value: string | number) {
    return this.targets
      .filter((target, index) => {
        if (this.cache[index][property] instanceof Array) {
          throw new Error('Filter by property array is not available');
        }
        return this.cache[index][property] === value;
      });
  }

  public getAllTargets() {
    return this.targets;
  }

  public getAllTargetsOptions() {
    return this.cache;
  }

  public getIndex(target) {
    return this.targets.indexOf(target);
  }

  public getByIndex(index: number) {
    return this.targets[index];
  }

  private create(target) {
    if (this.getIndex(target) === -1) {
      this.cache.push({});
      this.targets.push(target);
    }
  }

}

export const registry = new Registry();