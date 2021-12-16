import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, Meta } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { AppErrorHandler } from './app-error.handler'
import { StartupService } from '@services/startup.service';

/* services import */
import { MessageService, ConfirmationService } from 'primeng/api';
import { ShareService } from '@services/share.service';
import { AlertService } from '@services/alert.service';
import { LoadingService } from '@services/loading.service'
import { AuthService } from '@services/auth.service'
import { ConfigurationService } from '@services/configuration.service';
import { LocalStoreManager } from '@services/local-store-manager.service';
import { WindowService } from '@services/window.service';
import { AccountService } from '@services/account.service';
import { AccountEndpoint } from '@services/endpoints/account.endpoint';
import { NewsService } from '@services/news.service';
import { NewsEndpoint } from '@services/endpoints/news.endpoint';
import { FileService } from '@services/file.service';
import { FileEndpoint } from '@services/endpoints/file.endpoint';

/* directives */
import { AutofocusDirective } from '@directives/autofocus.directive';

/* root components */
import { AuthStorage } from '@helpers/auth-storage';
import { AccessDeniedComponent } from './components/accessdenied/accessdenied.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

/* modules */
import { AppRoutingModule } from './app-routing.module';
import { SharesModule } from '@shares/shares.module';
import { HomeModule } from '@home/home.module';
import { AdminModule } from '@admin/admin.module';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpRequestInterceptor } from '@helpers/httprequest.interceptor';



export function initializeApp(startup: StartupService) {
  return () => startup.initVersionCheckSchedule();
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharesModule,
    HomeModule,
    AdminModule,
    OAuthModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
    AccessDeniedComponent,
    AutofocusDirective,
    PageNotFoundComponent
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [StartupService], multi: true },
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: OAuthStorage, useClass: AuthStorage },
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true, },
    Meta,
    ShareService,
    AlertService, MessageService, ConfirmationService,
    LoadingService,
    AuthService,
    ConfigurationService,
    LocalStoreManager,
    WindowService,
    AccountEndpoint, AccountService,
    NewsEndpoint, NewsService,
    FileEndpoint, FileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
