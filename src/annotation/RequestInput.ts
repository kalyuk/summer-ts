export function RequestBody() {
  return requestCtx('body', 'body', null);
}

export function RequestQuery(name: string, defaultValue?: any) {
  return requestCtx('query', name, defaultValue);
}

export function RequestPath(name: string, defaultValue?: any) {
  return requestCtx('path', name, defaultValue);
}

export function RequestHeaders(name: string, defaultValue?: any) {
  return requestCtx('headers', name, defaultValue);
}

export function RequestCtx() {
  return requestCtx('ctx', null, {});
}

function requestCtx(key: string, name: string, defaultValue?: any) {
  return (target, propertyKey, parameterIndex) => {
    const data = Reflect.getMetadata('ctx', target, propertyKey) || [];
    data.push([key, parameterIndex, name, defaultValue]);
    Reflect.defineMetadata('ctx', data, target, propertyKey);
  };
}