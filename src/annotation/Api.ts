import { registry } from '../core/Registry';

export interface ApiSchema {
  $ref: string;
}

export interface ApiParam {
  in?: 'query' | 'header' | 'path' | 'cookie';
  name?: string;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: ApiSchema;
}

export type Produces = 'application/json' | 'application/xml';

export interface ApiOptions {
  tags?: string[] | number[];
  summary?: string;
  description?: string;
  operationId?: string;
  consumes?: Produces[];
  produces?: Produces[];
  parameters?: ApiParam[];
}

export function Api(options: ApiOptions = {}, apiName: string = 'Open API') {
  return (target, property) => {
    if (property) {
      registry.add(target.constructor, 'open.api', {property, options});
    } else {
      registry.add(target, 'open.api', {options});
    }
  };
}