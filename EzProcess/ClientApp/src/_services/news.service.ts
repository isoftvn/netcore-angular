import { Injectable } from "@angular/core";
import { NewsCategory } from "@models/news-category.model";
import { NewsTag } from "@models/news-tag.model";
import { forkJoin } from "rxjs";
import { NewsEndpoint } from "./endpoints/news.endpoint";

@Injectable()
export class NewsService {

    constructor(private newsEndpoint: NewsEndpoint) { }

    getNewsSettingDataSource() {
        return forkJoin(
            [
                this.newsEndpoint.getCategoriesEndpoint<NewsCategory[]>(true, 1, 20),
                this.newsEndpoint.getTagsEndpoint<NewsTag[]>()
            ]
        );
    }

    getCategories(includeDeleted: boolean, page?: number, pageSize?: number) {
        return this.newsEndpoint.getCategoriesEndpoint<NewsCategory>(includeDeleted, page, pageSize);
    }

    addCategory(item: NewsCategory) {
        return this.newsEndpoint.addCategoryEndpoint<NewsCategory>(item);
    }

    updateCategory(item: NewsCategory) {
        return this.newsEndpoint.updateCategoryEndpoint<NewsCategory>(item);
    }

    deleteCategory(objectId: string) {
        return this.newsEndpoint.deleteCategoryEndpoint<JSON>(objectId);
    }

    getTags(page?: number, pageSize?: number) {
        return this.newsEndpoint.getTagsEndpoint<NewsTag>(page, pageSize);
    }

    addTag(item: NewsTag) {
        return this.newsEndpoint.addTagEndpoint<NewsTag>(item);
    }

    deleteTag(objectId: string) {
        return this.newsEndpoint.deleteTagEndpoint<JSON>(objectId);
    }

    updateTag(item: NewsTag) {
        return this.newsEndpoint.updateTagEndpoint<NewsTag>(item);
    }
}