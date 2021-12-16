import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { GlobalFunctions } from './global-functions';

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {

      if (err.status >= 500 && !GlobalFunctions.showLoading) {
        return throwError(err);
      }

      var message = err.error && err.error.message ? err.error.message : '';
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this.authenticationService.logout();
        location.reload();
      }
      else if (err.status === 403) {
        this.router.navigateByUrl('/accessdenied?message=You do not have permission to perform this action');
      }
      else if (err.status === 404) {
        if (!err.url.includes('/appInfo.json')) {
          this.authenticationService.logout();
          var user = err.error && err.error.userName ? err.error.userName : '';
          this.router.navigateByUrl('/accessdenied?user=' + user + '&message=' + message);
        }
      }
      else if (err.status !== 200) {
        console.error(err);
      }
      return throwError(err);
    }))
  }
}
