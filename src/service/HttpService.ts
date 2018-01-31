import * as http from 'http';
import * as q from 'qs';
import { parse, URL } from 'url';
import { Autowired } from '../annotation/Autowired';
import { On } from '../annotation/On';
import { Service } from '../annotation/Service';
import { Value } from '../annotation/Value';
import { BASE_EVENT } from '../Application';
import { RequestContext } from '../core/RequestContext';
import { ResponseModel } from '../model/dto/ResponseModel';
import { EXECUTOR_EVENT_NAME } from './ExecutorService';
import { LOG_LEVEL, LoggerService } from './LoggerService';
import { RouterMethod } from './RouterService';

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

  private server: http.Server = http.createServer();

  @Autowired()
  private logger: LoggerService;

  constructor() {
    this.server.timeout = this.TIMEOUT * 1000;
    this.server.on('request', this.execute);
  }

  public execute = (request: http.IncomingMessage, response: http.ServerResponse) => {
    const parsedURL = parse(request.url);
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
        (this as any).getAppContext().emit(EXECUTOR_EVENT_NAME, context, (result: ResponseModel) => {
          const resultBody = result.to(request.headers['content-type']);

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

          response.statusCode = result.status;
          response.setHeader('Content-Length', Buffer.byteLength(resultBody).toString());
          response.write(resultBody);
          response.end();
        });
      });
  }

  @On(BASE_EVENT.AFTER_INITIALIZE)
  public listen() {
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