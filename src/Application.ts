import { defaultsDeep } from 'lodash';
import { BaseEvent } from './core/BaseEvent';
import { BeanFactory } from './core/BeanFactory';

export enum BASE_EVENT {
  INITIALIZED = 'initialized',
  AFTER_INITIALIZE = 'afterInitialize',
  STOP = 'stop'
}

export interface ApplicationConfiguration {
  [key: string]: any;

  id?: string;
}

export interface ApplicationConfigurationMap {
  default: ApplicationConfiguration;

  [env: string]: ApplicationConfiguration;
}

export class Application extends BaseEvent {
  public static contexts = {};

  private arguments: {[propName: string]: string | number} = {
    env: 'development',
    port: 1987
  };

  private configuration: ApplicationConfiguration = {
    id: 'SummerApplication'
  };

  private beanFactory: BeanFactory;

  constructor(configuration: ApplicationConfigurationMap = {default: {}}) {
    super();
    process.argv.forEach((val) => {
      const tmp = val.split('=');
      if (tmp.length === 2) {
        this.arguments[tmp[0].trim()] = tmp[1].trim();
      }
    });
    this.configuration = defaultsDeep(configuration[this.getArg('env')] || {}, configuration.default);
    const id = this.getConfig('id');

    if (Application.contexts[id]) {
      throw new Error(`Application context with name ${id} already exists`);
    }

    Application.contexts[id] = this;
    this.beanFactory = new BeanFactory(this);
  }

  public setBean(oldClass, newClass) {
    this.beanFactory.setBean(oldClass, newClass);
  }

  public init() {
    this.beanFactory.init();
    return this.emit(BASE_EVENT.INITIALIZED)
      .then(() => this.emit(BASE_EVENT.AFTER_INITIALIZE));
  }

  public getConfig(key: string) {
    return key.split('.').reduce((o, i) => o[i] ? o[i] : false, this.configuration);
  }

  public getArg(key: string) {
    return this.arguments[key];
  }

  public getBean(target) {
    return this.beanFactory.getBean(target);
  }

  public stop() {
    return this.emit('stop');
  }
}