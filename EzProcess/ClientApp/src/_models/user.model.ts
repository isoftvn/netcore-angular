export class User {
  // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
  constructor(id?: string, userName?: string, fullName?: string, email?: string, jobTitle?: string, phoneNumber?: string, roles?: string[]) {

    this.id = id as any;
    this.userName = userName as any;
    this.fullName = fullName as any;
    this.email = email as any;
    this.jobTitle = jobTitle as any;
    this.phoneNumber = phoneNumber as any;
    this.roles = roles as any;
  }

  public id: string;
  public userName: string;
  public fullName: string;
  public email: string;
  public jobTitle: string;
  public phoneNumber: string;
  public configuration: string;
  public isEnabled: boolean;
  public isLockedOut: boolean;
  public roles: string[];

  get friendlyName(): string {
    let name = this.fullName || this.userName;

    if (this.jobTitle) {
      name = this.jobTitle + ' ' + name;
    }

    return name;
  }
}
