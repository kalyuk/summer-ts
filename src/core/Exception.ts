export enum Exceptions {
  INVALID_INPUT_PARAMETERS = 400,
  AUTHENTICATION_IS_REQUIRED = 401,
  DOESNT_HAVE_PERMISSIONS = 403,
  NOT_FOUND = 404,
  BUSINESS_CONFLICT = 409,
  BUSINESS_LOGIC_ERROR = 422,
  SERVER_ERROR = 500
}

export interface ExceptionError {
  field: string;
  error: string;
}

export class Exception {
  get errors(): ExceptionError[] {
    return this._errors;
  }

  set errors(value: ExceptionError[]) {
    this._errors = value;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  get code(): Exceptions {
    return this._code;
  }

  set code(value: Exceptions) {
    this._code = value;
  }

  private _code: Exceptions;
  private _message: string;
  private _errors: ExceptionError[] = [];

  constructor(code: Exceptions, message: string, errors: ExceptionError[] = []) {
    this.code = code;
    this.message = message;
    this.errors = errors;
  }

  public toString() {
    return `${this.code}: ${this.message} ${this.errors ? JSON.stringify(this.errors) : ''}`;
  }

}