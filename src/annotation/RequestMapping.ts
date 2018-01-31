import { registry } from '../core/Registry';
import { ContentType, HttpPayload, ROUTER_PROP_KEY, RouterMethod } from '../service/RouterService';

export interface RequestMappingOptions {
  payload?: HttpPayload;
  contentType?: ContentType;
  status?: number;
}

export function RequestMapping(path: string, method: RouterMethod = RouterMethod.ALL, options: RequestMappingOptions = {}) {
  return (target, property, descriptor: PropertyDescriptor) => {
    if (!property) {
      throw new Error('RequestMapping maybe apply only to method');
    }
    const input = Reflect.getMetadata('design:paramtypes', target, property);
    const params = Reflect.getMetadata('ctx', target, property) || [];

    params.sort((a, b) => a[1] - b[1]);

    const action = descriptor.value;
    descriptor.value = function (ctx) {
      const args = [];
      params.forEach(([field, index, name, defaultValue]) => {
        const value = (!name) ? ctx : name.split('.')
          .reduce((o, i) => o[i] ? o[i] : defaultValue, name === field ? ctx : ctx[field]);

        args[index] = new input[index](value);
        Object.entries(Object.getOwnPropertyDescriptors(input[index].prototype))
          .filter(([key, subDescriptor]) => typeof subDescriptor.set === 'function')
          .forEach(([key]) => args[index][key] = value[key]);
      });
      return action.apply(this, input.map((_, index) => args[index] ? args[index] : this.getAppContext().getBean(input[index])));
    };
    registry.add(target.constructor, ROUTER_PROP_KEY, [property, {method, path}, options]);
  };
}

export function GetMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.GET, options);
}

export function AllMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.ALL, options);
}

export function OptionsMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.OPTIONS, options);
}

export function PostMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.POST, options);
}

export function PutMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.PUT, options);
}

export function HeadMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.HEAD, options);
}

export function TraceMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.TRACE, options);
}

export function DeleteMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.DELETE, options);
}

export function ConnectMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.CONNECT, options);
}

export function PatchMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.PATCH, options);
}

export function CommandMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.COMMAND, options);
}

export function DataMapping(path: string, options: RequestMappingOptions = {}) {
  return RequestMapping(path, RouterMethod.DATA, options);
}
