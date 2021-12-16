import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Utilities } from '@helpers/utilities';
import { Permission } from '@models/permission.model';
import { Role } from '@models/role.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { Subject } from 'rxjs';
import { RoleEditorComponent } from './role-editor.component';

@Component({
  selector: 'ezp-roles-management',
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.scss']
})
export class RolesManagementComponent implements OnInit, OnDestroy {

  columns: any[] = [];
  rows: Role[] = [];
  rowsCache: Role[] = [];
  allPermissions: Permission[] = [];
  editedRole: Role;
  sourceRole: Role;
  editingRoleName: { name: string };
  editingRoleModal: boolean;

  @ViewChild('roleEditor', { static: true })
  roleEditor: RoleEditorComponent;

  @Input()
  reloadEvent: Subject<any>;

  @Output()
  requireReload: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private alertService: AlertService,
    private accountService: AccountService) {
  }
  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

  ngOnInit() {
    this.columns = [
      { prop: 'name', header: 'Role Name' },
      { prop: 'description', header: 'Description' },
      { prop: 'usersCount', header: 'Users' },
      { prop: '', header: 'Action' },
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
      this.addNewRoleToList();
      this.editingRoleModal = false;
    }
    else {
      this.editedRole = null as any;
      this.sourceRole = null as any;
      this.editingRoleModal = false;
    }
  }

  addNewRoleToList() {
    if (this.sourceRole) {
      Object.assign(this.sourceRole, this.editedRole);

      let sourceIndex = this.rowsCache.indexOf(this.sourceRole, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rowsCache, sourceIndex, 0);
      }

      sourceIndex = this.rows.indexOf(this.sourceRole, 0);
      if (sourceIndex > -1) {
        Utilities.moveArrayItem(this.rows, sourceIndex, 0);
      }

      this.editedRole = null as any;
      this.sourceRole = null as any;
    }
    else {
      const role = new Role();
      Object.assign(role, this.editedRole);
      this.editedRole = null as any;

      let maxIndex = 0;
      for (const r of this.rowsCache) {
        if ((r as any).index > maxIndex) {
          maxIndex = (r as any).index;
        }
      }

      (role as any).index = maxIndex + 1;

      this.rowsCache.splice(0, 0, role);
      this.rows.splice(0, 0, role);
      this.rows = [...this.rows];
    }
    this.requireReload.emit(true);
  }

  loadData() {
    this.accountService.getRolesAndPermissions()
      .subscribe(results => {
        this.alertService.stopStickyMessage();

        const roles = results[0];
        const permissions = results[1];

        roles.forEach((role, index, roles) => {
          (role as any).index = index + 1;
        });


        this.rowsCache = [...roles];
        this.rows = roles;

        this.allPermissions = permissions;
      },
        error => {
          this.alertService.stopStickyMessage();

          this.alertService.startStickyMessage('Load Error', `Unable to retrieve roles from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
        });
  }

  onSearchChanged(value: string) {
    this.rows = this.rowsCache.filter(r => Utilities.searchArray(value, false, r.name, r.description));
  }

  onEditorModalHidden() {
    this.editingRoleName = null as any;
    this.roleEditor.resetForm(true);
  }

  newRole() {
    this.editingRoleName = null as any;
    this.sourceRole = null as any;
    this.editedRole = this.roleEditor.newRole(this.allPermissions);
    this.editingRoleModal = true;
  }

  editRole(row: Role) {
    this.editingRoleName = { name: row.name };
    this.sourceRole = row;
    this.editedRole = this.roleEditor.editRole(row, this.allPermissions);
    this.editingRoleModal = true;
  }

  deleteRole(event: Event, row: Role) {
    if (row.name != 'administrator') {
      this.alertService.showConfirm(event, 'Are you sure you want to delete \"' + row.name + '\" role?', () => this.deleteRoleHelper(row), null as any);
    }
    else {
      this.alertService.showMessage('Warning', 'You can not delete \"' + row.name + '\" role!', MessageSeverity.warn);
    }
  }

  deleteRoleHelper(row: Role) {

    this.alertService.startStickyMessage('Deleting...');

    this.accountService.deleteRole(row)
      .subscribe(results => {
        this.alertService.stopStickyMessage();

        this.rowsCache = this.rowsCache.filter(item => item !== row);
        this.rows = this.rows.filter(item => item !== row);
      },
        error => {
          this.alertService.stopStickyMessage();

          this.alertService.startStickyMessage('Delete Error', `An error occured whilst deleting the role.\r\nError: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
        });
  }

  get canManageRoles() {
    return this.accountService.userHasPermission(Permission.manageRolesPermission);
  }
}
