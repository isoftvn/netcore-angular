import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { fadeInOut } from '@services/animations.service';
import { MenuItem } from 'primeng/api/menuitem';
import { Subject } from 'rxjs';

@Component({
  selector: 'ezp-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [fadeInOut]
})
export class SettingsComponent implements OnInit {
  items: MenuItem[];
  activeIndex = 0;
  fragmentSubscription: any;
  readonly profileTab = 'profile';
  readonly usersTab = 'users';
  readonly rolesTab = 'roles';
  reloadUsers: Subject<any> = new Subject();
  reloadRoles: Subject<any> = new Subject();
  reloadProfile: Subject<any> = new Subject();
  requireReload: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService) {
  }

  ngOnInit() {
    this.fragmentSubscription = this.route.fragment.subscribe(anchor => this.showContent(anchor || this.profileTab));
  }

  ngOnDestroy() {
    this.fragmentSubscription.unsubscribe();
  }

  requireReloadEvent(event) {
    this.requireReload = event;
  }

  tabViewChange(event) {
    switch (event.index) {
      case 0:
        this.router.navigate(['/admin/settings'], {
          fragment: this.profileTab
        });
        this.reloadProfile.next(true);
        break;
      case 1:
        this.router.navigate(['/admin/settings'], {
          fragment: this.usersTab
        });
        if (this.requireReload) {
          this.reloadUsers.next(true);
          this.requireReload = false;
        }
        break;
      case 2:
        this.router.navigate(['/admin/settings'], {
          fragment: this.rolesTab
        });
        if (this.requireReload) {
          this.reloadRoles.next(true);
          this.requireReload = false;
        }
        break;
    }
  }

  showContent(anchor: string) {
    if (anchor) {
      anchor = anchor.toLowerCase();
    }
    else {
      anchor = this.profileTab;
    }

    if ((this.isFragmentEquals(anchor, this.usersTab) && !this.canViewUsers) ||
      (this.isFragmentEquals(anchor, this.rolesTab) && !this.canViewRoles)) {
      return;
    }

    switch (anchor) {
      case this.profileTab:
        this.activeIndex = 0;
        break;
      case this.usersTab:
        this.activeIndex = 1;
        break;
      case this.rolesTab:
        this.activeIndex = 2;
        break;
    }
  }

  isFragmentEquals(fragment1: string, fragment2: string) {
    if (fragment1 == null) {
      fragment1 = '';
    }
    if (fragment2 == null) {
      fragment2 = '';
    }
    return fragment1.toLowerCase() == fragment2.toLowerCase();
  }

  get canViewUsers() {
    return this.accountService.userHasPermission(Permission.viewUsersPermission) ||
      this.accountService.userHasPermission(Permission.manageUsersPermission);
  }

  get canViewRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission) ||
      this.accountService.userHasPermission(Permission.assignRolesPermission) ||
      this.accountService.userHasPermission(Permission.manageRolesPermission);
  }
}
