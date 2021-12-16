import { Component, OnInit, ViewChild } from '@angular/core';
import { Utilities } from '@helpers/utilities';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AlertService } from '@services/alert.service';
import { PostArticleComponent } from './modals/post-article.component';

@Component({
  selector: 'ezp-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
  columns: any[];
  rows: any[];
  editingArticleName: { name: string };
  showPostArticleModal: boolean;

  @ViewChild('postArticleComponent', { static: true })
  postArticleComponent: PostArticleComponent;

  constructor(
    private alertService: AlertService,
    private accountService: AccountService) {
  }

  ngOnInit(): void {
    this.columns = [
      { field: 'title', header: 'Title' },
      { field: 'tags', header: 'Tags' },
      { field: 'status', header: 'Publish' },
      { field: 'isAnnoucement', header: 'Annoucement' },
      { field: 'createdBy', header: 'Created' },
      { field: 'CreatedDate', header: 'Date' }
    ];
  }

  onSearchChanged(keyword: any) {
    //this.rows = this.rowsCache.filter(r => Utilities.searchArray(keyword, false, r.userName, r.fullName, r.email, r.jobTitle, r.roles));
  }

  newArticle() {
    // this.editingUserName = null as any;
    // this.sourceUser = null as any;
    // this.editedUser = this.userEditor.newUser(this.allRoles);
    this.showPostArticleModal = true;
  }

  editArticle(row: any) {
    // this.editingUserName = { name: row.userName };
    // this.sourceUser = row;
    // this.editedUser = this.userEditor.editUser(row, this.allRoles);
    // this.editingUserModal = true;
  }

  approveArticle(row: any) {

  }

  deleteArticle(event: Event, row: any) {
    //this.alertService.showConfirm(event, 'Are you sure you want to delete \"' + row.userName + '\"?', () => this.deleteUserHelper(row), null as any);
  }

  closeEvent(success: boolean) {
    // if (success) {
    //   this.addNewUserToList();
    //   this.editingUserModal = false;
    // }
    // else {
    //   this.editedUser = null as any;
    //   this.sourceUser = null as any;
    //   this.editingUserModal = false;
    // }
    this.showPostArticleModal = false;
  }

  get canPostArticle() {
    return this.accountService.userHasPermission(Permission.postArticlePermission);
  }

  get canViewArticle() {
    return this.accountService.userHasPermission(Permission.viewArticlePermission);
  }

  get canApproveArticle() {
    return this.accountService.userHasPermission(Permission.approveArticlePermission);
  }

  get canSettingsNews() {
    return this.accountService.userHasPermission(Permission.newSettingsPermission);
  }
}
