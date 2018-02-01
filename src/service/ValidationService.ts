import { validate } from 'class-validator';
import { Service } from '../annotation/Service';
import { Exception, Exceptions } from '../core/Exception';

@Service()
export class ValidationService {
  public async validate(target) {
    const errors = await validate(target);
    if (errors.length) {
      throw new Exception(
        Exceptions.BUSINESS_CONFLICT,
        'invalid_input_data',
        errors.map((error) => {
          return {
            field: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]]
          };
        }));
    }
    return true;
  }
}