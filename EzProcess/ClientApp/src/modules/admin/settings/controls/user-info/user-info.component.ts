import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Utilities } from '@helpers/utilities';
import { Permission } from '@models/permission.model';
import { Role } from '@models/role.model';
import { UserEdit } from '@models/user-edit.model';
import { User } from '@models/user.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'ezp-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit, OnDestroy {
  public isEditMode = false;
  public isNewUser = false;
  public isSaving = false;
  public isChangePassword = false;
  public isEditingSelf = false;
  public showValidationErrors = false;
  public uniqueId: string = Utilities.uniqueId();
  public user: User = new User();
  public userEdit: UserEdit;
  public allRoles: Role[] = [];

  public formResetToggle = true;

  @Output()
  closeEvent: EventEmitter<boolean> = new EventEmitter();

  @Input()
  isViewOnly: boolean;

  @Input()
  isGeneralEditor = false;

  @Input()
  reloadEvent: Subject<any>;

  @ViewChild('f')
  public form;

  // ViewChilds Required because ngIf hides template variables from global scope
  @ViewChild('userName')
  public userName;

  @ViewChild('userPassword')
  public userPassword;

  @ViewChild('email')
  public email;

  @ViewChild('currentPassword')
  public currentPassword;

  @ViewChild('newPassword')
  public newPassword;

  @ViewChild('confirmPassword')
  public confirmPassword;

  @ViewChild('roles')
  public roles;

  @ViewChild('rolesSelector')
  public rolesSelector;

  constructor(
    private alertService: AlertService,
    private accountService: AccountService) {
  }
  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

  ngOnInit() {
    if (!this.isGeneralEditor) {
      this.loadCurrentUserData();
    }
    this.reloadEvent.subscribe(event => {
      this.loadCurrentUserData();
    });
  }

  private loadCurrentUserData() {
    this.alertService.stopStickyMessage();

    if (this.canViewAllRoles) {
      this.accountService.getUserAndRoles().subscribe(results => this.onCurrentUserDataLoadSuccessful(results[0], results[1]), error => this.onCurrentUserDataLoadFailed(error));
    } else {
      this.accountService.getUser().subscribe(user => this.onCurrentUserDataLoadSuccessful(user, user.roles.map(x => new Role(x))), error => this.onCurrentUserDataLoadFailed(error));
    }
  }

  private onCurrentUserDataLoadSuccessful(user: User, roles: Role[]) {
    this.alertService.stopStickyMessage();
    this.user = user;
    this.allRoles = roles;
  }

  private onCurrentUserDataLoadFailed(error: any) {
    this.alertService.stopStickyMessage();
    this.alertService.startStickyMessage('Load Error', `Unable to retrieve user data from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`);

    this.user = new User();
  }

  getRoleByName(name: string) {
    return this.allRoles.find((r) => r.name == name);
  }

  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  deletePasswordFromUser(user: UserEdit | User) {
    const userEdit = user as UserEdit;
    userEdit.currentPassword = '';
    userEdit.newPassword = '';
    userEdit.confirmPassword = '';
  }

  edit() {
    if (!this.isGeneralEditor) {
      this.isEditingSelf = true;
      this.userEdit = new UserEdit();
      Object.assign(this.userEdit, this.user);
    } else {
      if (!this.userEdit) {
        this.userEdit = new UserEdit();
      }

      this.isEditingSelf = this.accountService.currentUser ? this.userEdit.id == this.accountService.currentUser.id : false;
    }

    this.isEditMode = true;
    this.showValidationErrors = true;
    this.isChangePassword = false;
  }

  save() {
    this.isSaving = true;
    this.alertService.startStickyMessage('Saving changes...');

    if (this.isNewUser) {
      this.accountService.newUser(this.userEdit).subscribe(user => this.saveSuccessHelper(user), error => this.saveFailedHelper(error));
    } else {
      this.accountService.updateUser(this.userEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }
  }

  private saveSuccessHelper(user?: User) {
    this.testIsRoleUserCountChanged(this.user, this.userEdit);

    if (user) {
      Object.assign(this.userEdit, user);
    }

    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.isChangePassword = false;
    this.showValidationErrors = false;

    this.deletePasswordFromUser(this.userEdit);
    Object.assign(this.user, this.userEdit);
    this.userEdit = new UserEdit();
    this.resetForm();

    if (this.isGeneralEditor) {
      if (this.isNewUser) {
        this.alertService.showMessage('Success', `User \"${this.user.userName}\" was created successfully`, MessageSeverity.success);
      } else if (!this.isEditingSelf) {
        this.alertService.showMessage('Success', `Changes to user \"${this.user.userName}\" was saved successfully`, MessageSeverity.success);
      }
    }

    if (this.isEditingSelf) {
      this.alertService.showMessage('Success', 'Changes to your User Profile was saved successfully', MessageSeverity.success);
      this.refreshLoggedInUser();
    }

    this.isEditMode = false;

    this.closeEvent.emit(true);
  }

  private saveFailedHelper(obj: any) {
    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.alertService.startStickyMessage("Error", JSON.stringify(obj.error?.errors), MessageSeverity.error);
    this.closeEvent.emit(false);
  }

  private testIsRoleUserCountChanged(currentUser: User, editedUser: User) {

    const rolesAdded = this.isNewUser ? editedUser.roles : editedUser.roles.filter(role => currentUser.roles.indexOf(role) == -1);
    const rolesRemoved = this.isNewUser ? [] : currentUser.roles.filter(role => editedUser.roles.indexOf(role) == -1);

    const modifiedRoles = rolesAdded.concat(rolesRemoved);

    if (modifiedRoles.length) {
      setTimeout(() => this.accountService.onRolesUserCountChanged(modifiedRoles));
    }
  }

  cancel() {
    if (this.isGeneralEditor) {
      this.userEdit = this.user = new UserEdit();
    } else {
      this.userEdit = new UserEdit();
    }

    this.showValidationErrors = false;
    this.resetForm();

    this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.info);
    this.alertService.stopStickyMessage();

    if (!this.isGeneralEditor) {
      this.isEditMode = false;
    }

    this.closeEvent.emit();
  }

  close() {
    this.userEdit = this.user = new UserEdit();
    this.showValidationErrors = false;
    this.resetForm();
    this.isEditMode = false;

    this.closeEvent.emit();
  }

  private refreshLoggedInUser() {
    this.accountService.refreshLoggedInUser()
      .subscribe(user => {
        this.loadCurrentUserData();
      },
        error => {
          this.alertService.stopStickyMessage();
          this.alertService.startStickyMessage('Refresh failed', 'An error occured whilst refreshing logged in user information from the server', MessageSeverity.error);
        });
  }

  changePassword() {
    this.isChangePassword = true;
  }

  unlockUser() {
    this.isSaving = true;
    this.alertService.startStickyMessage('Unblocking user...');

    this.accountService.unblockUser(this.userEdit.id)
      .subscribe(() => {
        this.isSaving = false;
        this.userEdit.isLockedOut = false;
        this.alertService.stopStickyMessage();
        this.alertService.showMessage('Success', 'User has been successfully unblocked', MessageSeverity.success);
      },
        error => {
          this.isSaving = false;
          this.alertService.stopStickyMessage();
          this.alertService.startStickyMessage('Unblock Error', 'The below errors occured whilst unblocking the user:', MessageSeverity.error);
        });
  }

  resetForm(replace = false) {
    this.isChangePassword = false;

    if (!replace) {
      this.form.reset();
    } else {
      this.formResetToggle = false;

      setTimeout(() => {
        this.formResetToggle = true;
      });
    }
  }

  newUser(allRoles: Role[]) {
    this.isGeneralEditor = true;
    this.isNewUser = true;

    this.allRoles = [...allRoles];
    this.user = this.userEdit = new UserEdit();
    this.userEdit.isEnabled = true;
    this.edit();

    return this.userEdit;
  }

  editUser(user: User, allRoles: Role[]) {
    if (user) {
      this.isGeneralEditor = true;
      this.isNewUser = false;

      this.setRoles(user, allRoles);
      this.user = new User();
      this.userEdit = new UserEdit();
      Object.assign(this.user, user);
      Object.assign(this.userEdit, user);
      this.edit();

      return this.userEdit;
    } else {
      return this.newUser(allRoles);
    }
  }

  displayUser(user: User, allRoles?: Role[]) {
    this.user = new User();
    Object.assign(this.user, user);
    this.deletePasswordFromUser(this.user);
    this.setRoles(user, allRoles);

    this.isEditMode = false;
  }

  private setRoles(user: User, allRoles?: Role[]) {
    this.allRoles = allRoles ? [...allRoles] : [];

    if (user.roles) {
      for (const ur of user.roles) {
        if (!this.allRoles.some(r => r.name == ur)) {
          this.allRoles.unshift(new Role(ur));
        }
      }
    }

    if (allRoles == null || this.allRoles.length != allRoles.length) {
      setTimeout(() => {
        if (this.rolesSelector) {
          this.rolesSelector.refresh();
        }
      });
    }
  }

  get canViewAllRoles() {
    return this.accountService.userHasPermission(Permission.viewRolesPermission);
  }

  get canAssignRoles() {
    return this.accountService.userHasPermission(Permission.assignRolesPermission);
  }
}
