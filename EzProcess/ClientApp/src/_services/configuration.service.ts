import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LocalStoreManager } from './local-store-manager.service';
import { DBkeys } from '@helpers/db-keys';
import { Utilities } from '@helpers/utilities';
import { environment } from '../environments/environment';

interface UserConfiguration {
  language: string;
  homeUrl: string
}

@Injectable()
export class ConfigurationService {

  constructor(
    private localStorage: LocalStoreManager) {

    this.loadLocalChanges();
  }

  set language(value: string) {
    this._language = value;
    this.saveToLocalStore(value, DBkeys.LANGUAGE);
  }
  get language() {
    return this._language || ConfigurationService.defaultLanguage;
  }

  set homeUrl(value: string) {
    this._homeUrl = value;
    this.saveToLocalStore(value, DBkeys.HOME_URL);
  }
  get homeUrl() {
    return this._homeUrl || ConfigurationService.defaultHomeUrl;
  }

  public static readonly appVersion: string = '1.0.0';

  // ***Specify default configurations here***
  public static readonly defaultLanguage: string = 'en';
  public static readonly defaultHomeUrl: string = '/admin';

  public baseUrl = environment.baseUrl || Utilities.baseUrl();
  public tokenUrl = environment.tokenUrl || environment.baseUrl || Utilities.baseUrl();
  public loginUrl = environment.loginUrl;
  public fallbackBaseUrl = 'https://ezprocess.net';
  // ***End of defaults***

  private _language: string = null as any;
  private _homeUrl: string = null as any;

  private onConfigurationImported: Subject<boolean> = new Subject<boolean>();
  configurationImported$ = this.onConfigurationImported.asObservable();

  private loadLocalChanges() {

    if (this.localStorage.exists(DBkeys.LANGUAGE)) {
      this._language = this.localStorage.getDataObject<string>(DBkeys.LANGUAGE);
    } else {
      this.resetLanguage();
    }

    if (this.localStorage.exists(DBkeys.HOME_URL)) {
      this._homeUrl = this.localStorage.getDataObject<string>(DBkeys.HOME_URL);
    }
  }

  private saveToLocalStore(data: any, key: string) {
    setTimeout(() => this.localStorage.savePermanentData(data, key));
  }

  public import(jsonValue: string) {

    this.clearLocalChanges();

    if (jsonValue) {
      const importValue: UserConfiguration = Utilities.JsonTryParse(jsonValue);

      if (importValue.language != null) {
        this.language = importValue.language;
      }

      if (importValue.homeUrl != null) {
        this.homeUrl = importValue.homeUrl;
      }
    }

    this.onConfigurationImported.next();
  }


  public export(changesOnly = true): string {

    const exportValue: UserConfiguration = {
      language: changesOnly ? this._language : this.language,
      homeUrl: changesOnly ? this._homeUrl : this.homeUrl
    };

    return JSON.stringify(exportValue);
  }


  public clearLocalChanges() {
    this._language = ConfigurationService.defaultLanguage;
    this._homeUrl = ConfigurationService.defaultHomeUrl;

    this.localStorage.deleteData(DBkeys.LANGUAGE);

    this.resetLanguage();
  }

  private resetLanguage() {
    this._language = ConfigurationService.defaultLanguage;
  }
}
