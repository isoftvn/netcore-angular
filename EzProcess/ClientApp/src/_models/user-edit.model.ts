import { User } from './user.model';

export class UserEdit extends User {
  public currentPassword: string;
  public newPassword: string;
  public confirmPassword: string;
}
