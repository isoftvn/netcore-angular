import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin.routing.module'
import { SharesModule } from '@shares/shares.module';
import { AdminEventService } from '@services/event.service';

import { NgxSummernoteModule } from 'ngx-summernote';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminComponent } from './admin.component';
import { AdminSideBarComponent } from './controls/admin-side-bar/admin-side-bar.component';
import { AdminNavBarComponent } from './controls/admin-nav-bar/admin-nav-bar.component';
import { UserInfoComponent } from './settings/controls/user-info/user-info.component';
import { UsersManagementComponent } from './settings/controls/users-management/users-management.component';
import { RolesManagementComponent } from './settings/controls/roles-management/roles-management.component';
import { RoleEditorComponent } from './settings/controls/roles-management/role-editor.component';
import { NewsComponent } from './news/news.component';
import { ArticleListComponent } from './news/controls/article-list/article-list.component';
import { PostArticleComponent } from './news/controls/article-list/modals/post-article.component';
import { NewsSettingsComponent } from './news/controls/news-settings/news-settings.component';
import { AddCategoryComponent } from './news/controls/news-settings/modals/add-category.component';
import { AddTagComponent } from './news/controls/news-settings/modals/add-tag.component';

@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    SettingsComponent,
    AdminSideBarComponent,
    AdminNavBarComponent,
    UserInfoComponent,
    UsersManagementComponent,
    RolesManagementComponent,
    RoleEditorComponent,
    NewsComponent,
    ArticleListComponent,
    PostArticleComponent,
    NewsSettingsComponent,
    AddCategoryComponent,
    AddTagComponent
  ],
  imports: [
    CommonModule, SharesModule,
    NgxSummernoteModule,
    AdminRoutingModule,
  ],
  providers: [AdminEventService]
})
export class AdminModule { }
