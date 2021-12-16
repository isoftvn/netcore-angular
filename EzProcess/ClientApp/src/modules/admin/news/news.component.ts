import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { fadeInOut } from '@services/animations.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'ezp-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  animations: [fadeInOut]
})
export class NewsComponent implements OnInit {
  activeIndex = 0;
  fragmentSubscription: any;
  readonly articleTab = 'articles';
  readonly configTab = 'config';
  reloadArticles: Subject<any> = new Subject();
  requireReload: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private accountService: AccountService) {

  }

  ngOnInit(): void {
    this.fragmentSubscription = this.route.fragment.subscribe(anchor => this.showContent(anchor || this.articleTab));
  }

  tabViewChange(event) {
    switch (event.index) {
      case 0:
        this.router.navigate(['/admin/news'], {
          fragment: this.articleTab
        });
        if (this.requireReload) {
          this.reloadArticles.next(true);
          this.requireReload = false;
        }
        break;
      case 1:
        this.router.navigate(['/admin/news'], {
          fragment: this.configTab
        });
        break;
    }
  }

  showContent(anchor: string) {
    if (anchor) {
      anchor = anchor.toLowerCase();
    }
    else {
      anchor = this.articleTab;
    }

    if ((this.isFragmentEquals(anchor, this.articleTab) && !this.canViewArticleTab) ||
      (this.isFragmentEquals(anchor, this.configTab) && !this.canViewSettingTab)) {
      return;
    }

    switch (anchor) {
      case this.articleTab:
        this.activeIndex = 0;
        break;
      case this.configTab:
        this.activeIndex = 1;
        break;
    }
  }

  isFragmentEquals(fragment1: string, fragment2: string) {
    if (fragment1 == null) {
      fragment1 = '';
    }
    if (fragment2 == null) {
      fragment2 = '';
    }
    return fragment1.toLowerCase() == fragment2.toLowerCase();
  }

  get canViewArticleTab() {
    return this.accountService.userHasPermission(Permission.viewArticlePermission) ||
      this.accountService.userHasPermission(Permission.approveArticlePermission) ||
      this.accountService.userHasPermission(Permission.postArticlePermission);
  }

  get canViewSettingTab() {
    return this.accountService.userHasPermission(Permission.newSettingsPermission);
  }
}
