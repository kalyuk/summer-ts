import { ValidatorOptions } from 'class-validator';

export interface RequestOptions {
  defaultValue?: any;
  validator?: ValidatorOptions;
  skipValidate?: boolean;
  validateGroups?: string[];
}

export function RequestBody(options: RequestOptions = {}) {
  return requestCtx('body', 'body', options);
}

export function RequestQuery(name: string, options: RequestOptions = {}) {
  return requestCtx('query', name, options);
}

export function RequestPath(name: string, options: RequestOptions = {}) {
  return requestCtx('path', name, options);
}

export function RequestHeaders(name: string, options: RequestOptions = {}) {
  return requestCtx('headers', name, options);
}

export function RequestCtx() {
  return requestCtx('ctx', null, {});
}

function requestCtx(key: string, name: string, options: RequestOptions = {}) {
  return function (target, propertyKey, parameterIndex)  {
    const data = Reflect.getMetadata('ctx', target, propertyKey) || [];
    options.validator = options.validator ? options.validator : {};
    data.push([key, parameterIndex, name, options]);
    Reflect.defineMetadata('ctx', data, target, propertyKey);
  };
}