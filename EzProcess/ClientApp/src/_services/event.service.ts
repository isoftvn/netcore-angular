import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminEventService {
    constructor() { }
    private showAdminSideBar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    public setAdminSideBar(value: boolean): void {
        this.showAdminSideBar.next(value);
    }
    public getAdminSideBar(): Observable<boolean> {
        return this.showAdminSideBar.asObservable();
    }

}