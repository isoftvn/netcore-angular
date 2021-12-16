import { PermissionValues } from './permission.model';

export interface AccessToken {
  nbf: number;
  exp: number;
  iss: string;
  aud: string | string[];
  client_id: string;
  sub: string;
  auth_time: number;
  idp: string;
  role: string | string[];
  permission: PermissionValues | PermissionValues[];
  name: string;
  email: string;
  phone_number: string;
  configuration: string;
  fullname: string;
  jobtitle: string;
  scope: string | string[];
}
