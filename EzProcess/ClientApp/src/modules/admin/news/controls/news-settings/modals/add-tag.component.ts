import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NewsTag } from '@models/news-tag.model';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { NewsService } from '@services/news.service';

@Component({
  selector: 'ezp-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.scss']
})
export class AddTagComponent implements OnInit {

  @Output()
  closeEvent: EventEmitter<NewsTag> = new EventEmitter();

  public form: FormGroup;
  public validated = false;
  public isSaving: boolean = false;
  public editedTag: NewsTag = new NewsTag();
  isEdit: boolean = false;
  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private accountService: AccountService, private alertService: AlertService, private newsService: NewsService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      tagName: ['', Validators.required]
    })
  }

  newItem() {
    this.validated = false;
    this.isEdit = false;
    this.form.reset();
    this.editedTag = new NewsTag();
  }

  editItem(item: NewsTag) {
    if (item) {
      this.isEdit = true;
      this.editedTag = item;
      this.form.setValue({ 'tagName': item.tagName });
    } else {
      return this.newItem();
    }
  }

  onSubmit() {
    this.validated = true;
    if (this.form.invalid) {
      return;
    }
    this.editedTag.tagName = this.form.get('tagName')?.value;
    this.isSaving = true;
    this.alertService.startStickyMessage('Saving changes...');
    if (this.isEdit) {
      this.newsService.updateTag(this.editedTag).subscribe(response => this.saveSuccessHelper(response), error => this.saveFailedHelper(error));
    }
    else {
      this.newsService.addTag(this.editedTag).subscribe(response => this.saveSuccessHelper(response), error => this.saveFailedHelper(error));
    }
  }

  private saveSuccessHelper(tag?: NewsTag) {
    this.isSaving = false;
    this.alertService.stopStickyMessage();
    this.alertService.showMessage('Success', `Tag \"${this.editedTag.tagName}\" was saved successfully`, MessageSeverity.success);
    this.validated = false;
    this.closeEvent.emit(tag);
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

  get canAddTag() {
    return this.accountService.userHasPermission(Permission.newSettingsPermission);
  }
}
