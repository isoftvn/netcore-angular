import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DBkeys } from '@helpers/db-keys';

import { Utilities } from '../_helpers/utilities';

@Injectable()
export class LocalStoreManager {
  private static syncListenerInitialised = false;

  private syncKeys: string[] = [];
  private initEvent = new Subject();

  private reservedKeys: string[] =
    [
      'sync_keys',
      'addToSyncKeys',
      'removeFromSyncKeys',
      'getSessionStorage',
      'setSessionStorage',
      'addToSessionStorage',
      'removeFromSessionStorage',
      'clearAllSessionsStorage'
    ];


  public initialiseStorageSyncListener() {
    if (LocalStoreManager.syncListenerInitialised == true) {
      return;
    }

    LocalStoreManager.syncListenerInitialised = true;
    window.addEventListener('storage', this.sessionStorageTransferHandler, false);
    this.syncSessionStorage();
  }

  public deinitialiseStorageSyncListener() {
    window.removeEventListener('storage', this.sessionStorageTransferHandler, false);
    LocalStoreManager.syncListenerInitialised = false;
  }

  public clearAllStorage() {
    this.clearAllSessionsStorage();
    this.clearLocalStorage();
  }

  public clearAllSessionsStorage() {
    this.clearInstanceSessionStorage();
    localStorage.removeItem(DBkeys.DBKEY_SYNC_KEYS);

    localStorage.setItem('clearAllSessionsStorage', '_dummy');
    localStorage.removeItem('clearAllSessionsStorage');
  }

  public clearInstanceSessionStorage() {
    sessionStorage.clear();
    this.syncKeys = [];
  }

  public clearLocalStorage() {
    localStorage.clear();
  }

  public saveSessionData(data: any, key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    this.removeFromSyncKeys(key);
    localStorage.removeItem(key);
    this.sessionStorageSetItem(key, data);
  }

  public saveSyncedSessionData(data: any, key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    localStorage.removeItem(key);
    this.addToSessionStorage(data, key);
  }

  public savePermanentData(data: any, key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    this.removeFromSessionStorage(key);
    this.localStorageSetItem(key, data);
  }

  public moveDataToSessionStorage(key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    const data = this.getData(key);

    if (data == null) {
      return;
    }

    this.saveSessionData(data, key);
  }

  public moveDataToSyncedSessionStorage(key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    const data = this.getData(key);

    if (data == null) {
      return;
    }

    this.saveSyncedSessionData(data, key);
  }

  public moveDataToPermanentStorage(key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    const data = this.getData(key);

    if (data == null) {
      return;
    }

    this.savePermanentData(data, key);
  }

  public exists(key = DBkeys.DBKEY_USER_DATA) {
    let data = sessionStorage.getItem(key);

    if (data == null) {
      data = localStorage.getItem(key);
    }

    return data != null;
  }

  public getData(key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    let data = this.sessionStorageGetItem(key);

    if (data == null) {
      data = this.localStorageGetItem(key);
    }

    return data;
  }

  public getDataObject<T>(key = DBkeys.DBKEY_USER_DATA, isDateType = false): T {
    let data = this.getData(key);

    if (data != null) {
      if (isDateType) {
        data = new Date(data);
      }
      return data as T;
    } else {
      return null as any;
    }
  }

  public deleteData(key = DBkeys.DBKEY_USER_DATA) {
    this.testForInvalidKeys(key);

    this.removeFromSessionStorage(key);
    localStorage.removeItem(key);
  }

  public getInitEvent(): Observable<any> {
    return this.initEvent.asObservable();
  }

  private sessionStorageTransferHandler = (event: StorageEvent) => {
    if (!event.newValue) {
      return;
    }

    if (event.key == 'getSessionStorage') {
      if (sessionStorage.length) {
        this.localStorageSetItem('setSessionStorage', sessionStorage);
        localStorage.removeItem('setSessionStorage');
      }
    } else if (event.key == 'setSessionStorage') {

      if (!this.syncKeys.length) {
        this.loadSyncKeys();
      }
      const data = JSON.parse(event.newValue);
      // console.info("Set => Key: Transfer setSessionStorage" + ",  data: " + JSON.stringify(data));

      for (const key in data) {

        if (this.syncKeysContains(key)) {
          this.sessionStorageSetItem(key, JSON.parse(data[key]));
        }
      }

      this.onInit();
    } else if (event.key == 'addToSessionStorage') {

      const data = JSON.parse(event.newValue);

      // console.warn("Set => Key: Transfer addToSessionStorage" + ",  data: " + JSON.stringify(data));

      this.addToSessionStorageHelper(data.data, data.key);
    } else if (event.key == 'removeFromSessionStorage') {

      this.removeFromSessionStorageHelper(event.newValue);
    } else if (event.key == 'clearAllSessionsStorage' && sessionStorage.length) {
      this.clearInstanceSessionStorage();
    } else if (event.key == 'addToSyncKeys') {
      this.addToSyncKeysHelper(event.newValue);
    } else if (event.key == 'removeFromSyncKeys') {
      this.removeFromSyncKeysHelper(event.newValue);
    }
  }

  private syncSessionStorage() {
    localStorage.setItem('getSessionStorage', '_dummy');
    localStorage.removeItem('getSessionStorage');
  }

  private addToSessionStorage(data: any, key: string) {
    this.addToSessionStorageHelper(data, key);
    this.addToSyncKeysBackup(key);

    this.localStorageSetItem('addToSessionStorage', { key, data });
    localStorage.removeItem('addToSessionStorage');
  }

  private addToSessionStorageHelper(data: any, key: string) {
    this.addToSyncKeysHelper(key);
    this.sessionStorageSetItem(key, data);
  }

  private removeFromSessionStorage(keyToRemove: string) {
    this.removeFromSessionStorageHelper(keyToRemove);
    this.removeFromSyncKeysBackup(keyToRemove);

    localStorage.setItem('removeFromSessionStorage', keyToRemove);
    localStorage.removeItem('removeFromSessionStorage');
  }

  private removeFromSessionStorageHelper(keyToRemove: string) {

    sessionStorage.removeItem(keyToRemove);
    this.removeFromSyncKeysHelper(keyToRemove);
  }

  private testForInvalidKeys(key: string) {
    if (!key) {
      throw new Error('key cannot be empty');
    }

    if (this.reservedKeys.some(x => x == key)) {
      throw new Error(`The storage key "${key}" is reserved and cannot be used. Please use a different key`);
    }
  }

  private syncKeysContains(key: string) {

    return this.syncKeys.some(x => x == key);
  }

  private loadSyncKeys() {
    if (this.syncKeys.length) {
      return;
    }

    this.syncKeys = this.getSyncKeysFromStorage();
  }

  private getSyncKeysFromStorage(defaultValue: string[] = []): string[] {
    const data = this.localStorageGetItem(DBkeys.DBKEY_SYNC_KEYS);

    if (data == null) {
      return defaultValue;
    } else {
      return data as string[];
    }
  }

  private addToSyncKeys(key: string) {
    this.addToSyncKeysHelper(key);
    this.addToSyncKeysBackup(key);

    localStorage.setItem('addToSyncKeys', key);
    localStorage.removeItem('addToSyncKeys');
  }

  private addToSyncKeysBackup(key: string) {
    const storedSyncKeys = this.getSyncKeysFromStorage();
    if (storedSyncKeys.length > 0) {
      if (!storedSyncKeys.some(x => x == key)) {
        storedSyncKeys.push(key);
        this.localStorageSetItem(DBkeys.DBKEY_SYNC_KEYS, storedSyncKeys);
      }
    }
  }

  private removeFromSyncKeysBackup(key: string) {
    const storedSyncKeys = this.getSyncKeysFromStorage();
    if (storedSyncKeys.length > 0) {
      const index = storedSyncKeys.indexOf(key);

      if (index > -1) {
        storedSyncKeys.splice(index, 1);
        this.localStorageSetItem(DBkeys.DBKEY_SYNC_KEYS, storedSyncKeys);
      }
    }
  }

  private addToSyncKeysHelper(key: string) {
    if (!this.syncKeysContains(key)) {
      this.syncKeys.push(key);
    }
  }

  private removeFromSyncKeys(key: string) {
    this.removeFromSyncKeysHelper(key);
    this.removeFromSyncKeysBackup(key);

    localStorage.setItem('removeFromSyncKeys', key);
    localStorage.removeItem('removeFromSyncKeys');
  }

  private removeFromSyncKeysHelper(key: string) {
    const index = this.syncKeys.indexOf(key);

    if (index > -1) {
      this.syncKeys.splice(index, 1);
    }
  }

  private localStorageSetItem(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private sessionStorageSetItem(key: string, data: any) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  private localStorageGetItem(key: string) {
    return Utilities.JsonTryParse(localStorage.getItem(key) ?? '{}');
  }

  private sessionStorageGetItem(key: string) {
    return Utilities.JsonTryParse(sessionStorage.getItem(key) ?? '{}');
  }

  private onInit() {
    setTimeout(() => {
      this.initEvent.next();
      this.initEvent.complete();
    });
  }
}
