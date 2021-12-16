import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertService, MessageSeverity } from './alert.service';

@Injectable({ providedIn: 'root' })
export class StartupService {
    // this will be replaced by actual hash post-build.js
    private currentHash = '#{EZP.POST_BUILD_HASH}';
    version: string = 'Development'
    constructor(private http: HttpClient, private alertService: AlertService) { }

    /**
    * Checks in every set frequency the version of frontend application
    * @param {number} frequency - in milliseconds, defaults to 15 minutes
    */
    public initVersionCheckSchedule(frequency = 1000 * 60 * 15) {
        setInterval(() => {
            this.checkVersion();
        }, frequency);
        this.checkVersion();
    }
    /**
    * Will do the call and check if the hash has changed or not
    */
    private checkVersion() {
        const jsonFile = `assets/appInfo.json`;
        this.http.get(jsonFile + '?t=' + new Date().getTime())
            .subscribe(
                (response: any) => {
                    this.version = response.version;
                    const hash = response.hash;
                    const hashChanged = this.hasHashChanged(this.currentHash, hash);
                    // If new version, we will notify to user & force reload application
                    if (hashChanged) {
                        this.alertService.startStickyMessage('System Annoucement', 'New version detected. Application will update...', MessageSeverity.warn);
                        setTimeout((() => {
                            window.location.reload(true);
                        }), 2000);
                    }
                    this.currentHash = hash;
                },
                (err) => {
                    console.error(err, 'Could not get appInfo.json file...');
                }
            );
    }
    /**
    * Checks if hash has changed.
    * This file has the JS hash, if it is a different one than in the version.json
    * we are dealing with version change
    * @param currentHash
    * @param newHash
    * @returns {boolean}
    */
    private hasHashChanged(currentHash, newHash) {
        if (!currentHash || currentHash === '#{EZP.POST_BUILD_HASH}') {
            return false;
        }
        return currentHash !== newHash;
    }
}
