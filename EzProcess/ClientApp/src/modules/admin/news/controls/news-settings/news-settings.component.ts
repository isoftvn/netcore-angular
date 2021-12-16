import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utilities } from '@helpers/utilities';
import { NewsCategory } from '@models/news-category.model';
import { NewsTag } from '@models/news-tag.model';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AlertService, MessageSeverity } from '@services/alert.service';
import { fadeInOut } from '@services/animations.service';
import { NewsService } from '@services/news.service';
import { MenuItem } from 'primeng/api';
import { AddCategoryComponent } from './modals/add-category.component';
import { AddTagComponent } from './modals/add-tag.component';

@Component({
  selector: 'ezp-news-settings',
  templateUrl: './news-settings.component.html',
  styleUrls: ['./news-settings.component.scss'],
  animations: [fadeInOut]
})
export class NewsSettingsComponent implements OnInit {

  menuItems: MenuItem[];
  categoryColumns: any[];
  tagColumns: any[];
  showSubTab: string = 'Categories';
  showAddCategoryModal: boolean = false;
  showAddTagModal: boolean = false;
  editingCategoryName: string = '';
  editingTagName: string = '';
  categories: NewsCategory[] = [];
  categoriesCache: NewsCategory[] = [];
  tags: NewsTag[] = [];
  tagsCache: NewsTag[] = [];
  editedTag: NewsTag;
  sourceTag: NewsTag;

  @ViewChild('addTagComponent', { static: true })
  addTagComponent: AddTagComponent;

  @ViewChild('addCategoryComponent', { static: true })
  addCategoryComponent: AddCategoryComponent;

  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService, private newsService: NewsService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.menuItems = [
      { label: 'Categories', icon: 'fas fa-list-alt', styleClass: 'active-menu', command: (evt) => this.menuSelected(evt) },
      { label: 'Tags', icon: 'fas fa-tags', command: (evt) => this.menuSelected(evt) },
      { label: 'Others', icon: 'fas fa-cogs', command: (evt) => this.menuSelected(evt) }
    ];

    this.categoryColumns = [
      { field: 'categoryName', header: 'Name' },
      { field: 'description', header: 'Desctiption' },
      { field: 'isDeleted', header: 'Deleted' },
      { field: 'parentCategory', header: 'Parent' },
      { field: '', header: 'Action' }
    ];

    this.tagColumns = [
      { field: 'tagName', header: 'Name' },
      { field: 'createdBy', header: 'Created' },
      { field: 'createdDate', header: 'Date' },
      { field: '', header: 'Action' }
    ];
  }

  ngAfterViewInit() {
    this.loadData();
  }

  loadData() {
    if (this.hasSettingPermission) {
      this.newsService.getNewsSettingDataSource().subscribe(results => this.onDataLoadSuccessful(results[0], results[1]), error => this.onDataLoadFailed(error));
    }
  }

  onDataLoadSuccessful(categories: NewsCategory[], tags: NewsTag[]) {
    this.alertService.stopStickyMessage();

    if (categories.length > 0) {
      categories.forEach((item, index) => {
        (item as any).index = index + 1;
      });
      this.categories = categories;
      this.categoriesCache = [...categories];
    }

    if (tags.length > 0) {
      tags.forEach((item, index) => {
        (item as any).index = index + 1;
      });
      this.tags = tags;
      this.tagsCache = [...tags];
    }
  }

  onDataLoadFailed(error: any) {
    this.alertService.startStickyMessage('Load Error', `Unable to retrieve users from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
  }

  newCategoryItem() {
    this.addCategoryComponent.newItem(this.categoriesCache);
    this.showAddCategoryModal = true;
  }

  editCategoryItem(row: NewsCategory) {
    this.addCategoryComponent.editItem(row, this.categoriesCache);
    this.showAddCategoryModal = true;
  }

  deleteCategoryItem(event: Event, row: NewsCategory) {
    this.alertService.showConfirm(event, 'Are you sure you want to delete \"' + row.categoryName + '\" category?', () => this.deleteCategoryItemHelper(row), null as any);
  }

  deleteCategoryItemHelper(row: NewsCategory) {
    this.alertService.startStickyMessage('Deleting...');
    this.newsService.deleteCategory(row.id)
      .subscribe(results => {
        this.alertService.stopStickyMessage();

        this.categoriesCache = this.categoriesCache.filter(item => item !== row);
        this.categories = this.categories.filter(item => item !== row);
      },
        error => {
          this.alertService.stopStickyMessage();
          this.alertService.startStickyMessage('Delete Error', `An error occured whilst deleting the role.\r\nError: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
        });
  }

  closeCategoryModalEvent(category: NewsCategory) {
    if (category) {
      this.addCategoryToList(category);
    }
    this.showAddCategoryModal = false;
  }

  addCategoryToList(category: NewsCategory) {
    let oldItem = null as any;
    if (this.categoriesCache && this.categoriesCache.length > 0) {
      oldItem = this.categoriesCache.find(x => x.id === category.id);
    }
    if (oldItem) {
      var index = this.categoriesCache.indexOf(oldItem);
      this.categoriesCache[index] = category;
      this.categories[index] = category;
    }
    else {
      let maxIndex = 0;
      for (const r of this.categoriesCache) {
        if ((r as any).index > maxIndex) {
          maxIndex = (r as any).index;
        }
      }

      (category as any).index = maxIndex + 1;
      this.categoriesCache.splice(0, 0, category);
      this.categories.splice(0, 0, category);
      this.categories = [...this.categories];
    }
  }

  newTagItem() {
    this.addTagComponent.newItem();
    this.showAddTagModal = true;
  }

  editTagItem(row: NewsTag) {
    this.addTagComponent.editItem(row);
    this.showAddTagModal = true;
  }

  deleteTagItem(event: Event, row: NewsTag) {
    this.alertService.showConfirm(event, 'Are you sure you want to delete \"' + row.tagName + '\" tag?', () => this.deleteTagItemHelper(row), null as any);
  }

  deleteTagItemHelper(row: NewsTag) {
    this.alertService.startStickyMessage('Deleting...');
    this.newsService.deleteTag(row.id)
      .subscribe(results => {
        this.alertService.stopStickyMessage();

        this.tagsCache = this.tagsCache.filter(item => item !== row);
        this.tags = this.tags.filter(item => item !== row);
      },
        error => {
          this.alertService.stopStickyMessage();
          this.alertService.startStickyMessage('Delete Error', `An error occured whilst deleting the role.\r\nError: "${Utilities.getHttpResponseMessages(error)}"`, MessageSeverity.error);
        });
  }

  closeTagModalEvent(tag: NewsTag) {
    if (tag) {
      this.addTagToList(tag);
    }
    this.showAddTagModal = false;
  }

  addTagToList(tag: NewsTag) {
    let oldItem = null as any;
    if (this.tagsCache && this.tagsCache.length > 0) {
      oldItem = this.tagsCache.find(x => x.id === tag.id);
    }
    if (oldItem) {
      var index = this.tagsCache.indexOf(oldItem);
      this.tagsCache[index] = tag;
      this.tags[index] = tag;
    }
    else {
      let maxIndex = 0;
      for (const r of this.tagsCache) {
        if ((r as any).index > maxIndex) {
          maxIndex = (r as any).index;
        }
      }

      (tag as any).index = maxIndex + 1;
      this.tagsCache.splice(0, 0, tag);
      this.tags.splice(0, 0, tag);
      this.tags = [...this.tags];
    }
  }

  menuSelected(evt: any) {
    this.showSubTab = evt.item.label;
    if (evt.originalEvent && evt.originalEvent.currentTarget) {
      let node = evt.originalEvent.currentTarget;
      if (node.parentNode && node.parentNode.parentNode) {
        var nodes = node.parentNode.parentNode.getElementsByTagName("li");
        var arrNodes = Array.prototype.slice.call(nodes);
        arrNodes.forEach(function (item) {
          item.classList.remove("active-menu");
        });
      }
      if (node.parentElement) {
        node.parentElement.classList.add("active-menu");
      }
    }
  }

  get hasSettingPermission() {
    return this.accountService.userHasPermission(Permission.newSettingsPermission);
  }
}
