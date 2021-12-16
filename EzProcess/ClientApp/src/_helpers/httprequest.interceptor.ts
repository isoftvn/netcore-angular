import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { LoadingService } from '../_services/loading.service';
import { finalize } from 'rxjs/operators';
import { GlobalFunctions } from './global-functions';
import { AuthService } from '@services/auth.service';

/** Inject With Credentials into the request */
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(public loadingService: LoadingService,
    protected authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    req = req.clone({
      withCredentials: true,
      setHeaders: {
        'Authorization': `Bearer ${this.authService.accessToken}`,
      },
    });
    if (GlobalFunctions.showLoading) {
      this.loadingService.show();
    }
    return next
      .handle(req)
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
