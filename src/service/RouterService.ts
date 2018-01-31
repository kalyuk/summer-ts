import { Autowired } from '../annotation/Autowired';
import { On } from '../annotation/On';
import { Service } from '../annotation/Service';
import { BASE_EVENT } from '../Application';
import { Exception, Exceptions } from '../core/Exception';
import { registry } from '../core/Registry';
import { RequestContext } from '../core/RequestContext';
import { LOG_LEVEL, LoggerService } from './LoggerService';

export type HttpPayload = {[key: string]: string | string[] | number[]};

export enum ContentType {
  text = 'text/html',
  json = 'application/json'
}

export const ROUTER_PROP_KEY = 'public.actions';

export enum RouterMethod {
  ALL = 'ALL',
  OPTIONS = 'OPTIONS',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  HEAD = 'HEAD',
  TRACE = 'TRACE',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  PATCH = 'PATCH',
  COMMAND = 'COMMAND',
  DATA = 'DATA'
}

export interface Route {
  method: RouterMethod;
  url: string;
  keyParams: string[];
  regexp: RegExp;
  payload: HttpPayload;
  action: Function;
}

@Service()
export class RouterService {

  @Autowired()
  public logger: LoggerService;

  private routes: Route[] = [];

  public add(method: RouterMethod, path, payload, action: Function): void {
    const keyParams = [];
    const url = path.replace(/<(.*?):(.*?)>/ig, (m, attr, key) => {
      keyParams.push(attr);
      return '(' + key + ')';
    });

    const route: Route = {
      action,
      keyParams,
      method,
      payload,
      regexp: new RegExp(`^${url}$`),
      url
    };
    this.routes.push(route);
    this.logger.render(LOG_LEVEL.INFO, 'Router added: ', route.method, route.url);
  }

  public match(ctx: RequestContext): Route {
    const {method, url} = ctx;
    let activeRoute: Route = null;

    this.routes
      .some((route: Route) => {
        if (route.method === RouterMethod.ALL || route.method === method) {
          const match = url.match(route.regexp);
          if (match) {
            activeRoute = {...route};

            route.keyParams.forEach((key, index) => {
              ctx.path[key] = decodeURIComponent(match[index + 1] || '');
            });
            return true;
          }
        }
        return false;
      });

    if (!activeRoute) {
      throw new Exception(Exceptions.NOT_FOUND, `Route by path "${method}: ${url}" not found`);
    }

    return activeRoute;
  }

  @On(BASE_EVENT.INITIALIZED)
  private autorun = () => {
    registry
      .getAllTargetsOptions()
      .forEach((props, index) => {
        if (props[ROUTER_PROP_KEY]) {
          props[ROUTER_PROP_KEY].forEach(([property, route, options]) => {
            const target = registry.getByIndex(index);
            const instance = (this as any).getAppContext().getBean(target);
            if (!instance[property]) {
              throw new Error(`property "${property}" is private`);
            }
            this.add(route.method, route.path, options.payload, instance[property].bind(instance));
          });
        }
      });
  }
}