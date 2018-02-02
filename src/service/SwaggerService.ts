import { On } from '../annotation/On';
import { RequestMapping } from '../annotation/RequestMapping';
import { Service } from '../annotation/Service';
import { Value } from '../annotation/Value';
import { BASE_EVENT } from '../Application';

export const SWAGGER_INFO = {
  contact: {},
  description: '',
  license: {},
  termsOfService: '',
  title: '',
  version: ''
};

@Service()
export class SwaggerService {

  @Value('summer-ts.swagger.version', '2.0')
  private swagger: string;

  @Value('summer-ts.swagger.info', SWAGGER_INFO)
  private info: any;

  @Value('summer-ts.swagger.host', 'localhost')
  private host: string;

  @Value('summer-ts.swagger.basePath', '')
  private basePath: string;

  @Value('summer-ts.swagger.tags', [])
  private tags: string;

  @Value('summer-ts.swagger.schemes', [])
  private schemes: string;

  @Value('summer-ts.swagger.externalDocs', {})
  private externalDocs: string;

  private securityDefinitions: any = {};

  private paths: any = {};

  private definitions: any = {};

  private document: any = {};

  @RequestMapping((c) => c('summer-ts.swagger.apiUrl', '/api/doc/swagger'))
  public getDocument() {
    return this.document;
  }

  @On(BASE_EVENT.INITIALIZED)
  private autorun = () => {
    this.document = {
      basePath: this.basePath,
      definitions: this.definitions,
      externalDocs: this.externalDocs,
      host: this.host,
      info: this.info,
      paths: this.paths,
      schemes: this.schemes,
      securityDefinitions: this.securityDefinitions,
      swagger: this.swagger,
      tags: this.tags
    };
  }
}