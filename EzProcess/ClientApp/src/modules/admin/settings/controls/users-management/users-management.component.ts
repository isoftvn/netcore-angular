import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Utilities } from '@helpers/utilities';
import { Permission } from '@models/permission.model';
import { Role } from '@models/role.model';
import { UserEdit } from '@models/user-edit.model';
import { User } from '@models/user.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { Subject } from 'rxjs';
import { UserInfoComponent } from '../user-info/user-info.component';

@Component({
  selector: 'ezp-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  columns: any[];
  rows: User[] = [];
  rowsCache: User[] = [];
  editedUser: UserEdit;
  sourceUser: UserEdit;
  editingUserName: { name: string };
  editingUserModal: boolean;

  allRoles: Role[] = [];
  reloadProfile: Subject<any> = new Subject();

  @Input()
  reloadEvent: Subject<any>;

  @Output()
  requireReload: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('userEditor', { static: true })
  userEditor: UserInfoComponent;

  constructor(
    private alertService: AlertService,
    private accountService: AccountService) {
  }

  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

  ngOnInit() {
    this.columns = [
      { field: 'jobTitle', header: 'Job Title' },
      { field: 'userName', header: 'UserName' },
      { field: 'fullName', header: 'FullName' },
      { field: 'email', header: 'Email' },
      { field: 'roles', header: 'Roles' },
      { field: 'phoneNumber', header: 'Phone' },
      { field: '', header: 'Action' },
    ];

    this.reloadEvent.subscribe(event => {
      this.loadData();
    });
  }

  ngAfterViewInit() {
    this.loadData();
  }

  closeEvent(success: boolean) {
    if (success) {
      this.addNewUserToList();
      this.editingUserModal = false;
    }
    else {
      this.editedUser = null as any;
      this.sourceUser = null as any;
      this.editingUserModal = false;
    }
  }

  addNewUserToList() {
    if (this.sourceUser) {
      Object.assign(this.sourceUser, this.editedUser);

      let sourceIndex = this.rowsCache.indexOf(this.sourceUser, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rowsCache, sourceIndex, 0);
      }

      sourceIndex = this.rows.indexOf(this.sourceUser, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rows, sourceIndex, 0);
      }

      this.editedUser = null as any;
      this.sourceUser = null as any;
    } else {
      const user = new User();
      Object.assign(user, this.editedUser);
      this.editedUser = null as any;

      let maxIndex = 0;
      for (const u of this.rowsCache) {
        if ((u as any).index > maxIndex) {
          maxIndex = (u as any).index;
        }
      }

      (user as any).index = maxIndex + 1;

      this.rowsCache.splice(0, 0, user);
      this.rows.splice(0, 0, user);
      this.rows = [...this.rows];
    }
    this.requireReload.emit(true);
  }

  loadData() {
    if (this.canViewRoles) {
      this.accountService.getUsersAndRoles().subscribe(results => this.onDataLoadSuccessful(results[0], results[1]), error => this.onDataLoadFailed(error));
    } else {
      this.accountService.getUsers().subscribe(users => this.onDataLoadSuccessful(users, this.accountService.currentUser.roles.map(x => new Role(x))), error => this.onDataLoadFailed(error));
    }
  }

  onDataLoadSuccessful(users: User[], roles: Role[]) {
    this.alertService.stopStickyMessage();

    users.forEach((user, index) => {
      (user as any).index = index + 1;
    });

    this.rowsCache = [...users];
    this.rows = users;

    this.allRoles = roles;
  }

  onDataLoadFailed(error: any) {
    this.alertService.startStickyMessage('Load Error', `Unable to retrieve users from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
  }

  onSearchChanged(keyword: any) {
    this.rows = this.rowsCache.filter(r => Utilities.searchArray(keyword, false, r.userName, r.fullName, r.email, r.jobTitle, r.roles));
  }

  onEditorModalHidden() {
    this.editingUserName = null as any;
    this.userEditor.resetForm(true);
  }

  newUser() {
    this.editingUserName = null as any;
    this.sourceUser = null as any;
    this.editedUser = this.userEditor.newUser(this.allRoles);
    this.editingUserModal = true;
  }

  editUser(row: UserEdit) {
    this.editingUserName = { name: row.userName };
    this.sourceUser = row;
    this.editedUser = this.userEditor.editUser(row, this.allRoles);
    this.editingUserModal = true;
  }

  deleteUser(event: Event, row: UserEdit) {
    this.alertService.showConfirm(event, 'Are you sure you want to delete \"' + row.userName + '\"?', () => this.deleteUserHelper(row), null as any);
  }

  deleteUserHelper(row: UserEdit) {

    this.alertService.startStickyMessage('Deleting...');

    this.accountService.deleteUser(row)
      .subscribe(results => {
        this.alertService.stopStickyMessage();

        this.rowsCache = this.rowsCache.filter(item => item !== row);
        this.rows = this.rows.filter(item => item !== row);
      },
        error => {
          this.alertService.stopStickyMessage();

          this.alertService.startStickyMessage('Delete Error', `${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
        });
  }

  get canAssignRoles() {
    return this.accountService.userHasPermission(Permission.assignRolesPermission);
  }

  get canViewRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }

  get canManageUsers() {
    return this.accountService.userHasPermission(Permission.manageUsersPermission);
  }
}
