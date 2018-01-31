import { Service } from '../annotation/Service';
import { Value } from '../annotation/Value';

export const LOG_LEVEL = {
  DEBUG: 0,
  ERROR: 3,
  INFO: 1,
  RENDER: 4,
  WARNING: 2
};

@Service()
export class LoggerService {
  @Value('summer-ts.logger.log-level', LOG_LEVEL.INFO)
  private readonly LOG_LEVEL;

  public render(type, ...args) {
    if (this.LOG_LEVEL <= type) {
      console.log.apply(console, args);
    }
  }
}