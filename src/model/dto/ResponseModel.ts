import { IncomingHttpHeaders } from 'http';

export class ResponseModel {
  public status?: number = 200;

  public headers?: IncomingHttpHeaders;

  public static getPublicJSON(data: any) {
    const obj = {};
    if (data.constructor.name === 'Object') {
      return data;
    }

    Object.entries(Object.getOwnPropertyDescriptors(data.constructor.prototype))
      .filter(([key, descriptor]) => typeof descriptor.get === 'function')
      .forEach(([key]) => {
        obj[key] = (typeof data[key] === 'object') ? ResponseModel.getPublicJSON(data[key]) : data[key];
      });

    return obj;
  }

  constructor(public body?: any) {

  }

  public to(contentType: string = '') {
    if (typeof this.body !== 'string') {
      switch (contentType.split(';')[0]) {
        default:
          return JSON.stringify(ResponseModel.getPublicJSON(this.body));
      }
    }
    return this.body;
  }
}