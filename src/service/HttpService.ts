import * as http from 'http';
import * as q from 'qs';
import { parse, URL } from 'url';
import { Autowired } from '../annotation/Autowired';
import { On } from '../annotation/On';
import { RequestMapping } from '../annotation/RequestMapping';
import { Service } from '../annotation/Service';
import { Value } from '../annotation/Value';
import { BASE_EVENT } from '../Application';
import { RequestContext } from '../core/RequestContext';
import { ResponseModel } from '../model/dto/ResponseModel';
import { EXECUTOR_EVENT_NAME } from './ExecutorService';
import { LOG_LEVEL, LoggerService } from './LoggerService';
import { RouterMethod, RouterService } from './RouterService';

export const HTTP_REQUEST_EVENT = Symbol('HTTP_REQUEST_EVENT');
export const HTTP_RESPONSE_EVENT = Symbol('HTTP_RESPONSE_EVENT');

@Service()
export class HttpService {

  @Value('summer-ts.http.host', '0.0.0.0')
  private readonly HOST: string;

  @Value('summer-ts.http.timeout', 30)
  private readonly TIMEOUT: number;

  @Value('summer-ts.http.port', 1987)
  private readonly PORT: number;

  @Value('summer-ts.http.body-size', 1e6)
  private readonly MAX_POST_BODY_LEN: number;

  @Value('summer-ts.http.cors', true)
  private readonly ENABLE_CORS: boolean;

  @Value('summer-ts.http.cors-origin', '*')
  private readonly HEADER_ORIGIN: string;

  @Value('summer-ts.http.cors-methods', '*')
  private readonly HEADER_METHODS: string;

  @Value('summer-ts.http.cors-max-age', 1728000)
  private readonly HEADER_MAX_AGE: number;

  @Value('summer-ts.http.cors-headers', '*')
  private readonly HEADER_HEADERS: string;

  private server: http.Server = http.createServer();

  @Autowired()
  private router: RouterService;

  @Autowired()
  private logger: LoggerService;

  constructor() {
    this.server.timeout = this.TIMEOUT * 1000;
    this.server.on('request', this.execute);
  }

  @On(HTTP_REQUEST_EVENT)
  public onRequest = (context, callback: Function) => {
    return (this as any).getAppContext().emit(EXECUTOR_EVENT_NAME, context, callback);
  }

  @On(HTTP_RESPONSE_EVENT)
  public onResponse = ({request, response, result}) => {
    const resultBody = result.status === 204 ? '' : result.to(request.headers['content-type']);

    if (result.headers) {
      Object.keys(result.headers)
        .forEach((headerName) => {
          if (typeof result.headers[headerName] === 'string') {
            return response.setHeader(headerName, result.headers[headerName]);
          }
          return (result.headers[headerName] as any[])
            .forEach((headerContent) => {
              response.setHeader(headerName, headerContent);
            });
        });
    }

    if (this.ENABLE_CORS) {
      response.setHeader('Access-Control-Allow-Origin', this.HEADER_ORIGIN);
      response.setHeader('Access-Control-Max-Age', this.HEADER_MAX_AGE);
      response.setHeader('Access-Control-Allow-Methods', this.HEADER_METHODS);
      response.setHeader('Access-Control-Allow-Headers', this.HEADER_HEADERS);
    }

    response.statusCode = result.status;
    response.setHeader('Content-Length', Buffer.byteLength(resultBody).toString());
    response.write(resultBody);
    response.end();
  }

  public execute = (request: http.IncomingMessage, response: http.ServerResponse) => {
    const parsedURL = parse(request.url);
    const appContext = (this as any).getAppContext();
    const url = new URL('http://' + request.headers.host);
    const context = new RequestContext(
      url.hostname,
      request.headers,
      request.method as RouterMethod,
      parsedURL.pathname,
      ((request.headers['x-forwarded-for'] as string || '').split(',')[0] || request.connection.remoteAddress)
    );

    if (parsedURL.query) {
      context.query = q.parse(parsedURL.query);
    }

    this.readBody(request)
      .then((body) => {
        context.body = body;
        return appContext
          .emit(HTTP_REQUEST_EVENT, context, (result: ResponseModel) => {
            return appContext.emit(HTTP_RESPONSE_EVENT, {request, response, result, context});
          });
      });
  }

  @On(BASE_EVENT.AFTER_INITIALIZE)
  public listen() {
    if (this.ENABLE_CORS) {
      this.router.add(RouterMethod.OPTIONS, '<path:.*>', {}, () => (new ResponseModel('', 204)));
    }
    return new Promise((resolve) => {
      this.server.listen(this.PORT, this.HOST, resolve);
    })
      .then(() => {
        this.logger.render(LOG_LEVEL.INFO, `==> Listening on port ${this.PORT}.`);
      });
  }

  @On(BASE_EVENT.STOP)
  public stop() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }

  private readBody(request: http.IncomingMessage): Promise<void> {
    return new Promise((resolve: Function) => {
      if (request.method === RouterMethod.POST
        || request.method === RouterMethod.PUT
        || request.method === RouterMethod.PATCH
      ) {
        let body = '';
        request.on('data', (data) => {
          body += data;
          if (body.length > this.MAX_POST_BODY_LEN) {
            request.connection.destroy();
          }
        });

        request.on('end', () => {
          if (body && body.length) {
            const type = (request.headers['content-type'] as string).split(';')[0];
            switch (type) {
              case 'application/json':
                resolve(JSON.parse(body));
                break;
              default:
                resolve(q.parse(body));
            }
          }
        });
      } else {
        resolve({});
      }
    });
  }
}