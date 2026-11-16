import { ErrorHandler, Injectable, RESPONSE_INIT, inject } from '@angular/core';

@Injectable()
export class ServerErrors implements ErrorHandler {
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  handleError(_error: unknown): void {
    if (this.response) {
      this.response.status = 500;
    }

    console.error('{"event":"app.render_failed"}');
  }
}
