import { Injectable } from '@angular/core';

@Injectable()
export class DBkeys {

  public static readonly CURRENT_USER = 'current_user';
  public static readonly USER_PERMISSIONS = 'user_permissions';
  public static readonly REMEMBER_ME = 'remember_me';
  public static readonly LANGUAGE = 'en';
  public static readonly HOME_URL = 'home_url';
  public static readonly DBKEY_USER_DATA = 'user_data';
  public static readonly DBKEY_SYNC_KEYS = 'sync_keys';
}
