import { Autowired } from '../annotation/Autowired';
import { On } from '../annotation/On';
import { Service } from '../annotation/Service';
import { Exception } from '../core/Exception';
import { RequestContext } from '../core/RequestContext';
import { ResponseModel } from '../model/dto/ResponseModel';
import { RouterService } from './RouterService';

export const EXECUTOR_EVENT_NAME = 'route-execute';

@Service()
export class ExecutorService {

  @Autowired()
  private routerService: RouterService;

  public async execute(ctx: RequestContext): Promise<ResponseModel> {
    try {
      const route = await this.routerService.match(ctx);
      const result = route.action(ctx);

      if (result instanceof ResponseModel) {
        return result;
      }

      return new ResponseModel(result);

    } catch (e) {
      const response = new ResponseModel();
      response.body = {message: e.message};
      if (e instanceof Exception) {
        response.status = e.code;
        response.body.errors = e.errors;
      }
      return response;
    }
  }

  @On(EXECUTOR_EVENT_NAME)
  public onRequest = (context, callback: Function) => {
    this.execute(context)
      .then((result) => {
        if (callback) {
          callback(result);
        }
      });
  }

}