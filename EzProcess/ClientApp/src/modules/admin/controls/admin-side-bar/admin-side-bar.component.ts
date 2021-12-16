import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Permission } from '@models/permission.model';
import { AccountService } from '@services/account.service';
import { AdminEventService } from '@services/event.service';
import { WindowService } from '@services/window.service';

@Component({
  selector: 'ezp-admin-side-bar',
  templateUrl: './admin-side-bar.component.html',
  styleUrls: ['./admin-side-bar.component.scss'],
  animations: [
    trigger('hideShowAnimator', [
      state('true', style({ opacity: 1 })),
      state('false', style({ opacity: 0 })),
      transition('0 => 1', animate('.5s')),
      transition('1 => 0', animate('.9s'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdminSideBarComponent implements OnInit, OnDestroy {
  showSideBar: boolean = true;
  initCompleted: boolean = false;
  constructor(private ref: ChangeDetectorRef, private eventService: AdminEventService, private windowService: WindowService, private accountService: AccountService) {

  }

  ngOnInit(): void {
    this.eventService.getAdminSideBar().subscribe(data => {
      if (this.initCompleted) {
        if (this.showSideBar == data) {
          this.showSideBar = !this.showSideBar;
        }
        else {
          this.showSideBar = data;
        }
      }
      this.ref.detectChanges()
    });
    if (this.windowService.windowRef.innerWidth < 768) {
      this.showSideBar = false;
    }
    this.initCompleted = true;
  }

  ngOnDestroy() {
  }

  get hasNewsPermission() {
    return this.accountService.userHasPermission(Permission.postArticlePermission) ||
      this.accountService.userHasPermission(Permission.viewArticlePermission) ||
      this.accountService.userHasPermission(Permission.approveArticlePermission) ||
      this.accountService.userHasPermission(Permission.newSettingsPermission);
  }

}
