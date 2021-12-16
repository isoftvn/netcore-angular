import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StartupService } from '@services/startup.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  version: string = 'Development'

  constructor(private router: Router, private metaService: Meta, private titleService: Title, private startup: StartupService, private translate: TranslateService) {
    setTimeout(() => {
      this.version = this.startup.version;
    }, 500);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.titleService.setTitle('EzProcess Solutions, LLC');
    this.metaService.addTags([
      { charset: 'UTF-8' },
      { name: 'keywords', content: 'EzProcess Solutions, optimize workflow, workflow management, project management' },
      { name: 'author', content: 'EzProcess Solutions, LLC' },
      { name: 'description', content: 'EzProcess Solutions provides completely solutions about workflow management, project management to improve your business.' },
      { name: 'robots', content: 'index, follow' }
    ]);
  }

  getYear() {
    return new Date().getUTCFullYear();
  }

  isFixedFooterPage() {
    if (this.router.url.startsWith('/login')
      || this.router.url.startsWith('/accessdenied')
      || this.router.url.startsWith('/pagenotfound')
      || this.router.url.startsWith('/admin')) {
      return 'fixed-bottom';
    }
    return '';
  }
}
