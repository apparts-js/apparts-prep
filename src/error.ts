export class HttpError {
  public code: number;
  public readonly type = "HttpError";
  public message: string;
  public description: string;
  constructor(code: number, message: string, description?: string) {
    this.code = code;
    if (message) {
      this.message = message;
      if (description) {
        this.description = description;
      }
    } else {
      this.message = this.getDefaultMessage(code);
    }
  }

  getDefaultMessage(code: number) {
    switch (code) {
      case 400:
        return "Bad Request";
      case 401:
        return "Unauthorized";
      case 403:
        return "Forbidden";
      default:
        return "Unexpected Error";
    }
  }

  static notFound(element: string) {
    throw new HttpError(404, `${element} not found`);
  }
}
