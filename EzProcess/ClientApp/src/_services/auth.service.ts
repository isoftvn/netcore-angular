import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, Subject, from, throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

import { LocalStoreManager } from './local-store-manager.service';
import { AuthStorage } from '@helpers/auth-storage';
import { ConfigurationService } from './configuration.service';
import { DBkeys } from '@helpers/db-keys';
import { JwtHelper } from '@helpers/jwt-helper';
import { Utilities } from '@helpers/utilities';
import { AccessToken } from '@models/access-token.model';
import { User } from '@models/user.model';
import { PermissionValues } from '@models/permission.model';

@Injectable()
export class AuthService {
  private readonly _discoveryDocUrl: string = '/.well-known/openid-configuration';

  private get discoveryDocUrl() { return this.configurations.tokenUrl + this._discoveryDocUrl; }
  public get baseUrl() { return this.configurations.baseUrl; }
  public get loginUrl() { return this.configurations.loginUrl; }
  public get homeUrl() { return this.configurations.homeUrl; }

  public loginRedirectUrl: string;
  public logoutRedirectUrl = "/";

  public reLoginDelegate: () => void;

  private previousIsLoggedInCheck = false;
  private _loginStatus = new Subject<boolean>();

  constructor(
    private router: Router,
    private oauthService: OAuthService,
    private configurations: ConfigurationService,
    private localStorage: LocalStoreManager) {

    this.initializeLoginStatus();
  }

  private initializeLoginStatus() {
    this.localStorage.getInitEvent().subscribe(() => {
      this.reEvaluateLoginStatus();
    });
  }

  gotoPage(page: string, preserveParams = true) {
    const navigationExtras: NavigationExtras = {
      queryParamsHandling: preserveParams ? 'merge' : '', preserveFragment: preserveParams
    };
    this.router.navigate([page], navigationExtras);
  }

  gotoHomePage() {
    this.router.navigate([this.homeUrl]);
  }

  redirectLoginUser() {
    const redirect = this.loginRedirectUrl && this.loginRedirectUrl != '/' && this.loginRedirectUrl != ConfigurationService.defaultHomeUrl ? this.loginRedirectUrl : this.homeUrl;
    this.loginRedirectUrl = null as any;

    const urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
    const urlAndParams = Utilities.splitInTwo(urlParamsAndFragment.firstPart, '?');

    const navigationExtras: NavigationExtras = {
      fragment: urlParamsAndFragment.secondPart,
      queryParams: Utilities.getQueryParamsFromString(urlAndParams.secondPart),
      queryParamsHandling: 'merge'
    };

    this.router.navigate([urlAndParams.firstPart], navigationExtras);
  }

  redirectLogoutUser() {
    const redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
    this.logoutRedirectUrl = null as any;
    this.router.navigate([redirect]);
  }

  redirectForLogin() {
    this.loginRedirectUrl = this.router.url;
    this.router.navigate([this.loginUrl]);
  }

  reLogin() {
    if (this.reLoginDelegate) {
      this.reLoginDelegate();
    } else {
      this.redirectForLogin();
    }
  }

  refreshLogin(): Observable<User> {
    if (this.oauthService.discoveryDocumentLoaded) {
      return from(this.oauthService.refreshToken()).pipe(
        map(() => this.processLoginResponse(this.oauthService.getAccessToken(), this.rememberMe)));
    } else {
      this.configureOauthService(this.rememberMe);
      return from(this.oauthService.loadDiscoveryDocument(this.discoveryDocUrl)).pipe(mergeMap(() => this.refreshLogin()));
    }
  }

  login(userName: string, password: string, rememberMe?: boolean) {
    if (this.isLoggedIn) {
      this.logout();
    }

    this.configureOauthService(rememberMe);

    return from(this.oauthService.loadDiscoveryDocument(this.discoveryDocUrl)).pipe(mergeMap(() => {
      return from(this.oauthService.fetchTokenUsingPasswordFlow(userName, password)).pipe(
        map(() => this.processLoginResponse(this.oauthService.getAccessToken(), rememberMe ?? false))
      );
    }));
  }

  private configureOauthService(rememberMe?: boolean) {
    this.oauthService.issuer = this.baseUrl;
    this.oauthService.clientId = 'ezp_spa';
    this.oauthService.scope = 'openid email phone profile offline_access roles ezp_api';
    this.oauthService.skipSubjectCheck = true;
    this.oauthService.dummyClientSecret = 'not_used';

    AuthStorage.RememberMe = rememberMe ?? false;
  }

  private processLoginResponse(accessToken: string, rememberMe: boolean) {

    if (accessToken == null) {
      throw new Error('accessToken cannot be null');
    }

    const jwtHelper = new JwtHelper();
    const decodedAccessToken = jwtHelper.decodeToken(accessToken) as AccessToken;

    const permissions: PermissionValues[] = Array.isArray(decodedAccessToken.permission) ? decodedAccessToken.permission : [decodedAccessToken.permission];

    if (!this.isLoggedIn) {
      this.configurations.import(decodedAccessToken.configuration);
    }

    const user = new User(
      decodedAccessToken.sub,
      decodedAccessToken.name,
      decodedAccessToken.fullname,
      decodedAccessToken.email,
      decodedAccessToken.jobtitle,
      decodedAccessToken.phone_number,
      Array.isArray(decodedAccessToken.role) ? decodedAccessToken.role : [decodedAccessToken.role]);
    user.isEnabled = true;

    this.saveUserDetails(user, permissions, rememberMe);

    this.reEvaluateLoginStatus(user);

    return user;
  }

  private saveUserDetails(user: User, permissions: PermissionValues[], rememberMe: boolean) {
    if (rememberMe) {
      this.localStorage.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
    } else {
      this.localStorage.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
      this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
    }

    this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
  }

  logout(): void {
    this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
    this.localStorage.deleteData(DBkeys.CURRENT_USER);

    this.configurations.clearLocalChanges();
    this.oauthService.logOut(true);
    this.reEvaluateLoginStatus();
  }

  private reEvaluateLoginStatus(currentUser?: User) {
    const user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    const isLoggedIn = user != null && user.userName != undefined;

    if (this.previousIsLoggedInCheck != isLoggedIn) {
      setTimeout(() => {
        this._loginStatus.next(isLoggedIn);
      });
    }

    this.previousIsLoggedInCheck = isLoggedIn;
  }

  getLoginStatusEvent(): Observable<boolean> {
    return this._loginStatus.asObservable();
  }

  get currentUser(): User {
    const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
    this.reEvaluateLoginStatus(user);
    return user;
  }

  get userPermissions(): PermissionValues[] {
    return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) || [];
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  get accessTokenExpiryDate(): Date {
    return new Date(this.oauthService.getAccessTokenExpiration());
  }

  get isSessionExpired(): boolean {
    if (this.accessTokenExpiryDate == null) {
      return true;
    }

    return this.accessTokenExpiryDate.valueOf() <= new Date().valueOf();
  }

  get refreshToken(): string {
    return this.oauthService.getRefreshToken();
  }

  get isLoggedIn(): boolean {
    return this.currentUser != null && this.currentUser.userName != undefined;
  }

  get rememberMe(): boolean {
    return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) == true;
  }
}
