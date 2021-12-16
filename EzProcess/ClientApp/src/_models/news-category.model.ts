export class NewsCategory {
    public id: string;
    public categoryName: string;
    public description: string;
    public isDeleted: boolean;
    public parentCategory: string;
    public parentCategoryName: string;
    public createdBy: string;
    public updatedBy: string;
    public updatedDate: Date;
    public createdDate: Date;
}