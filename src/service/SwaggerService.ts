import { On } from '../annotation/On';
import { RequestMapping } from '../annotation/RequestMapping';
import { Service } from '../annotation/Service';
import { BASE_EVENT } from '../Application';

@Service()
export class SwaggerService {

  @RequestMapping('/api/doc/swagger')
  public getDocument() {
    return 'doc';
  }

  @On(BASE_EVENT.INITIALIZED)
  private autorun = () => {

  }
}