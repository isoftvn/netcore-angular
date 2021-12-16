import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "@services/auth.service";
import { ConfigurationService } from "@services/configuration.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { EndpointBase } from "./_base.endpoint";

@Injectable()
export class NewsEndpoint extends EndpointBase {
    private readonly _newsUrl: string = '/api/news';
    get newsUrl() { return this.configurations.baseUrl + this._newsUrl; }

    constructor(private configurations: ConfigurationService, http: HttpClient, authService: AuthService) {
        super(http, authService);
    }

    getCategoriesEndpoint<T>(includeDeleted: boolean, page?: number, pageSize?: number): Observable<T> {
        return this.http.get<T>(this.newsUrl + '/categories/' + includeDeleted)
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.getCategoriesEndpoint(includeDeleted, page, pageSize));
                })
            );
    }

    addCategoryEndpoint<T>(itemObject: any): Observable<T> {
        return this.http.put<T>(this.newsUrl + '/categories', JSON.stringify(itemObject))
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.addCategoryEndpoint(itemObject));
                })
            );
    }

    updateCategoryEndpoint<T>(itemObject: any): Observable<T> {
        return this.http.patch<T>(this.newsUrl + '/categories', JSON.stringify(itemObject))
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.updateCategoryEndpoint(itemObject));
                })
            );
    }

    deleteCategoryEndpoint<T>(objectId: string): Observable<T> {
        return this.http.delete<T>(this.newsUrl + '/categories/' + objectId)
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.deleteCategoryEndpoint(objectId));
                })
            );
    }

    getTagsEndpoint<T>(page?: number, pageSize?: number): Observable<T> {
        return this.http.get<T>(this.newsUrl + '/tags')
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.getTagsEndpoint(page, pageSize));
                })
            );
    }

    addTagEndpoint<T>(itemObject: any): Observable<T> {
        return this.http.put<T>(this.newsUrl + '/tags', JSON.stringify(itemObject))
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.addCategoryEndpoint(itemObject));
                })
            );
    }

    deleteTagEndpoint<T>(objectId: string): Observable<T> {
        return this.http.delete<T>(this.newsUrl + '/tags/' + objectId)
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.deleteTagEndpoint(objectId));
                })
            );
    }

    updateTagEndpoint<T>(itemObject: any): Observable<T> {
        return this.http.patch<T>(this.newsUrl + '/tags', JSON.stringify(itemObject))
            .pipe<T>(
                catchError(error => {
                    return this.handleError(error, () => this.updateTagEndpoint(itemObject));
                })
            );
    }
}