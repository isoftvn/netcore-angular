import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-accessdenied',
  templateUrl: './accessdenied.component.html'
})

export class AccessDeniedComponent implements OnInit {
  public loginName: string = '';
  public errorMessage: string = '';
  public title: string = '';

  constructor(
    private route: ActivatedRoute,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.loginName = this.route.snapshot.queryParamMap.get('user') ?? '';
    this.errorMessage = this.route.snapshot.queryParamMap.get('message') ?? '';
    this.title = this.route.snapshot.queryParamMap.get('title') ?? '';

    this.route.queryParamMap.subscribe(queryParams => {
      this.loginName = queryParams.get('user') ?? '';
      this.errorMessage = queryParams.get('message') ?? '';
    });
    if (this.title) {
      this.titleService.setTitle(this.title);
    }
    else {
      this.titleService.setTitle('Access Denied');
    }
  }
}
