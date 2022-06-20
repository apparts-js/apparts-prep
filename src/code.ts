export class HttpCode {
  public code: number;
  public readonly type = "HttpCode";
  public message: string;
  public description: string;

  constructor(code: number, message: string) {
    this.code = code;
    if (message) {
      this.message = message;
    } else {
      this.message = this.getDefaultMessage(code);
    }
  }

  getDefaultMessage(code: number) {
    switch (code) {
      default:
        return "";
    }
  }
}

export class DontRespond {
  public readonly type = "DontRespond";

  constructor() {}
}
