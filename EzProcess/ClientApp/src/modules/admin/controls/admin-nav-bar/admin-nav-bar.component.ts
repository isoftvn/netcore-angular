import { Component, OnDestroy, OnInit } from '@angular/core';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AuthService } from '@services/auth.service';
import { AdminEventService } from '@services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ezp-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.scss']
})
export class AdminNavBarComponent implements OnInit, OnDestroy {
  showSideBar: boolean = true;
  currentUser: string = '';

  constructor(private authService: AuthService, private eventService: AdminEventService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser.fullName;
  }

  ngOnDestroy() {
  }

  toggleSideBar() {
    this.showSideBar = !this.showSideBar
    this.eventService.setAdminSideBar(this.showSideBar);
  }

  get showAdminMenu() {
    return this.accountService.userHasPermission(Permission.viewUsersPermission) || this.accountService.userHasPermission(Permission.viewRolesPermission);
  }
}
