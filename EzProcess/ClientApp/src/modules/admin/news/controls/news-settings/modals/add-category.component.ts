import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsCategory } from '@models/news-category.model';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { NewsService } from '@services/news.service';

@Component({
  selector: 'ezp-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {

  @Output()
  closeEvent: EventEmitter<NewsCategory> = new EventEmitter();

  public form: FormGroup;
  public validated = false;
  public isSaving: boolean = false;
  public editedItem: NewsCategory = new NewsCategory();
  isEdit: boolean = false;
  get f() { return this.form.controls; }
  get categoryName() {
    return this.form.get('categoryName');
  }
  get description() {
    return this.form.get('description');
  }
  get isDeleted() {
    return this.form.get('isDeleted');
  }
  get parentCategory() {
    return this.form.get('parentCategory');
  }
  parentCategories: NewsCategory[] = [];
  selectedParentCategory: string;

  constructor(private fb: FormBuilder, private accountService: AccountService, private alertService: AlertService, private newsService: NewsService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      categoryName: ['', Validators.required],
      description: [''],
      isDeleted: [false],
      parentCategory: ['']
    })
  }

  newItem(parents: NewsCategory[]) {
    this.isEdit = false;
    this.validated = false;
    this.form.reset();
    this.parentCategories = parents;
    this.editedItem = new NewsCategory();
  }

  editItem(item: NewsCategory, parents: NewsCategory[]) {
    if (item) {
      this.form.reset();
      this.isEdit = true;
      this.editedItem = item;
      this.parentCategories = parents.filter(p => p.id !== item.id);
      this.selectedParentCategory = item.parentCategory;
      this.form.setValue({ 'categoryName': item.categoryName, 'description': item.description, 'isDeleted': item.isDeleted, 'parentCategory': item.parentCategory });
    } else {
      return this.newItem(parents);
    }
  }

  onSubmit() {
    this.validated = true;
    if (this.form.invalid) {
      return;
    }
    this.editedItem.categoryName = this.categoryName?.value;
    this.editedItem.description = this.description?.value;
    this.editedItem.isDeleted = this.isDeleted?.value ?? false;
    this.editedItem.parentCategory = this.parentCategory?.value;
    this.isSaving = true;
    this.alertService.startStickyMessage('Saving changes...');
    if (this.isEdit) {
      this.newsService.updateCategory(this.editedItem).subscribe(response => this.saveSuccessHelper(response), error => this.saveFailedHelper(error));
    }
    else {
      this.newsService.addCategory(this.editedItem).subscribe(response => this.saveSuccessHelper(response), error => this.saveFailedHelper(error));
    }
  }

  private saveSuccessHelper(item?: NewsCategory) {
    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.alertService.showMessage('Success', `Category \"${item?.categoryName}\" was saved successfully`, MessageSeverity.success);
    this.validated = false;
    this.closeEvent.emit(item);
  }

  private saveFailedHelper(obj: any) {
    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.alertService.startStickyMessage("Error", JSON.stringify(obj.error?.errors), MessageSeverity.error);
    this.closeEvent.emit(null as any);
  }

  cancel() {
    this.validated = false;
    this.closeEvent.emit();
  }

  get canAddCategory() {
    return this.accountService.userHasPermission(Permission.newSettingsPermission);
  }
}
