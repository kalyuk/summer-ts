import { RouterMethod } from '../service/RouterService';

export class RequestContext {
  constructor(public hostname: string,
              public headers,
              public method: RouterMethod,
              public url: string,
              public ip: string,
              public path: any = {},
              public query: any = {},
              public body: any = '') {
  }
}
