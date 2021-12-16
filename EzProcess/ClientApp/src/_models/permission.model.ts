export type PermissionNames =
  'View Users' | 'Manage Users & Groups' |
  'View Roles' | 'Manage Roles' | 'Assign Roles';

export type PermissionValues =
  'users.view' | 'users.manage' |
  'roles.view' | 'roles.manage' | 'roles.assign' |
  'news.view' | 'news.settings' | 'news.post' | 'news.approve';

export class Permission {

  public static readonly viewUsersPermission: PermissionValues = 'users.view';
  public static readonly manageUsersPermission: PermissionValues = 'users.manage';

  public static readonly viewRolesPermission: PermissionValues = 'roles.view';
  public static readonly manageRolesPermission: PermissionValues = 'roles.manage';
  public static readonly assignRolesPermission: PermissionValues = 'roles.assign';

  public static readonly newSettingsPermission: PermissionValues = 'news.settings';
  public static readonly postArticlePermission: PermissionValues = 'news.post';
  public static readonly viewArticlePermission: PermissionValues = 'news.view';
  public static readonly approveArticlePermission: PermissionValues = 'news.approve';

  constructor(name: PermissionNames, value?: PermissionValues, groupName?: string, description?: string) {
    this.name = name;
    this.value = value as any;
    this.groupName = groupName as any;
    this.description = description as any;
  }

  public name: PermissionNames;
  public value: PermissionValues;
  public groupName: string;
  public description: string;
}
