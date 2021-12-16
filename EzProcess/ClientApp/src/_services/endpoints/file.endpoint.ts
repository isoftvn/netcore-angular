import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';
import { EndpointBase } from './_base.endpoint';
import { ConfigurationService } from '@services/configuration.service';


@Injectable()
export class FileEndpoint extends EndpointBase {

    private readonly _uploadUrl: string = '/api';

    get uploadUrl() { return this.configurations.baseUrl + this._uploadUrl; }

    constructor(private configurations: ConfigurationService, http: HttpClient, authService: AuthService) {

        super(http, authService);
    }
}
