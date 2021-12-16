import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { AlertService, MessageSeverity } from '@services/alert.service';


import { UserLogin } from '@models/user-login.model';
import { Utilities } from '@helpers/utilities';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ezp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {

  userLogin = new UserLogin();
  loginStatusSubscription: any;
  isLoading = false;
  formResetToggle = true;
  error = '';
  quotes = ["Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.",
    "The road to success is not easy to navigate, but with hard work, drive and passion, it's possible to achieve the dream.",
    "Focused, hard work is the real key to success. Keep your eyes on the goal, and just keep taking the next step towards completing it. If you aren't sure which way to do something, do it both ways and see which works better."
  ]
  todayQuotes = '';
  returnUrl: string;
  fragment: string;

  constructor(private alertService: AlertService, private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    this.getQuotes();
    var returnParam = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    var arr = returnParam.split('#');
    if (arr.length > 1) {
      this.returnUrl = arr[0];
      this.fragment = arr[1];
    }
    else {
      this.returnUrl = returnParam;
    }
  }

  ngOnInit() {
    this.userLogin.rememberMe = this.authService.rememberMe;

    if (this.getShouldRedirect()) {
      this.authService.redirectLoginUser();
    } else {
      this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
        if (this.getShouldRedirect()) {
          this.authService.redirectLoginUser();
        }
      });
    }
  }

  getQuotes() {
    setTimeout(() => {
      this.todayQuotes = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    });
  }

  ngOnDestroy() {
    if (this.loginStatusSubscription) {
      this.loginStatusSubscription.unsubscribe();
    }
  }

  getShouldRedirect() {
    return this.authService.isLoggedIn && !this.authService.isSessionExpired;
  }

  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  showLoginValidation(username, password) {
    var message = '';
    if (!username) {
      message = 'Username';
    }
    if (!password) {
      if (username) {
        message = 'Password';
      }
      else {
        message += ' and password';
      }
    }
    message += ' is required!';
    this.alertService.showMessage('Required', message, MessageSeverity.error);
  }

  login() {
    this.isLoading = true;
    this.alertService.startStickyMessage('', 'Attempting login...');

    this.authService.login(this.userLogin.userName, this.userLogin.password, this.userLogin.rememberMe)
      .subscribe(
        user => {
          setTimeout(() => {
            this.alertService.stopStickyMessage();
            this.isLoading = false;
            this.reset();
            this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
            this.router.navigate([this.returnUrl], { fragment: this.fragment });
          })
        },
        error => {
          this.alertService.stopStickyMessage();
          if (Utilities.checkNoNetwork(error)) {
            this.alertService.showMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error);
          } else {
            const errorMessage = Utilities.getHttpResponseMessage(error);
            if (errorMessage) {
              this.alertService.showMessage('Unable to login', this.mapLoginErrorMessage(errorMessage), MessageSeverity.error);
            } else {
              this.alertService.showMessage('Unable to login', 'An error occured whilst logging in, please try again later.\nError: ' + Utilities.getResponseBody(error), MessageSeverity.error);
            }
          }

          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        });
  }

  mapLoginErrorMessage(error: string) {
    if (error == 'invalid_username_or_password') {
      return 'Invalid username or password';
    }
    if (error == 'invalid_grant') {
      return 'This account has been disabled';
    }
    return error;
  }

  reset() {
    this.formResetToggle = false;

    setTimeout(() => {
      this.formResetToggle = true;
    });
  }
}
