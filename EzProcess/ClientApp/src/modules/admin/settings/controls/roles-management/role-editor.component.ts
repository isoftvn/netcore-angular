import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Permission } from '@models/permission.model';
import { Role } from '@models/role.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';

type NewType = EventEmitter<boolean>;

@Component({
  selector: 'ezp-role-editor',
  templateUrl: './role-editor.component.html',
  styleUrls: ['./role-editor.component.scss']
})
export class RoleEditorComponent implements OnInit {

  private isNewRole = false;
  private editingRoleName: string;

  public isSaving: boolean;
  public roleEdit: Role = new Role();
  public allPermissions: Permission[] = [];
  public selectedValues: { [key: string]: boolean; } = {};
  public formResetToggle = true;

  @Output()
  closeEvent: NewType = new EventEmitter();

  @ViewChild('f')
  private form;

  constructor(
    private alertService: AlertService,
    private accountService: AccountService) {
  }
  ngOnInit() {

  }

  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  save() {
    this.isSaving = true;
    this.alertService.startStickyMessage('Saving changes...');

    this.roleEdit.permissions = this.getSelectedPermissions();

    if (this.isNewRole) {
      this.accountService.newRole(this.roleEdit).subscribe(role => this.saveSuccessHelper(role), error => this.saveFailedHelper(error));
    } else {
      this.accountService.updateRole(this.roleEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }
  }

  private saveSuccessHelper(role?: Role) {
    if (role) {
      Object.assign(this.roleEdit, role);
    }

    this.isSaving = false;
    this.alertService.stopStickyMessage();

    if (this.isNewRole) {
      this.alertService.showMessage('Success', `Role \"${this.roleEdit.name}\" was created successfully`, MessageSeverity.success);
    } else {
      this.alertService.showMessage('Success', `Changes to role \"${this.roleEdit.name}\" was saved successfully`, MessageSeverity.success);
    }

    this.roleEdit = new Role();
    this.resetForm();


    if (!this.isNewRole && this.accountService.currentUser.roles.some(r => r == this.editingRoleName)) {
      this.refreshLoggedInUser();
    }

    this.closeEvent.emit(true);
  }

  private refreshLoggedInUser() {
    this.accountService.refreshLoggedInUser()
      .subscribe(user => { },
        error => {
          this.alertService.stopStickyMessage();
          this.alertService.startStickyMessage('Refresh failed', 'An error occured whilst refreshing logged in user information from the server', MessageSeverity.error);
        });
  }

  private saveFailedHelper(obj: any) {
    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.alertService.startStickyMessage("Error", JSON.stringify(obj.error?.errors), MessageSeverity.error);

    this.closeEvent.emit(false);
  }

  cancel() {
    this.roleEdit = new Role();
    this.resetForm();

    this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.info);
    this.alertService.stopStickyMessage();

    this.closeEvent.emit();
  }

  selectAll() {
    this.allPermissions.forEach(p => this.selectedValues[p.value] = true);
  }

  selectNone() {
    this.allPermissions.forEach(p => this.selectedValues[p.value] = false);
  }

  toggleGroup(groupName: string) {
    let firstMemberValue: boolean;

    this.allPermissions.forEach(p => {
      if (p.groupName != groupName) {
        return;
      }

      if (firstMemberValue == null) {
        firstMemberValue = this.selectedValues[p.value] == true;
      }

      this.selectedValues[p.value] = !firstMemberValue;
    });
  }

  private getSelectedPermissions() {
    return this.allPermissions.filter(p => this.selectedValues[p.value] == true);
  }

  resetForm(replace = false) {

    if (!replace) {
      this.form.reset();
    } else {
      this.formResetToggle = false;

      setTimeout(() => {
        this.formResetToggle = true;
      });
    }
  }

  newRole(allPermissions: Permission[]) {
    this.isNewRole = true;

    this.editingRoleName = null as any;
    this.allPermissions = allPermissions;
    this.selectedValues = {};
    this.roleEdit = new Role();

    return this.roleEdit;
  }

  editRole(role: Role, allPermissions: Permission[]) {
    if (role) {
      this.isNewRole = false;

      this.editingRoleName = role.name;
      this.allPermissions = allPermissions;
      this.selectedValues = {};
      role.permissions.forEach(p => this.selectedValues[p.value] = true);
      this.roleEdit = new Role();
      Object.assign(this.roleEdit, role);

      return this.roleEdit;
    } else {
      return this.newRole(allPermissions);
    }
  }

  get canManageRoles() {
    return this.accountService.userHasPermission(Permission.manageRolesPermission);
  }
}
