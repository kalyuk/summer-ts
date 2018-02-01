import { validate } from 'class-validator';
import { Service } from '../annotation/Service';
import { Exception, ExceptionError, Exceptions } from '../core/Exception';

@Service()
export class ValidationService {
  public async validate(target) {
    const errors = await validate(target);
    if (errors.length) {
      throw new Exception(
        Exceptions.BUSINESS_CONFLICT,
        'invalid_input_data',
        errors.map((error): ExceptionError => {
          return {
            error: error.constraints[Object.keys(error.constraints)[0]],
            field: error.property
          };
        }));
    }
    return true;
  }
}