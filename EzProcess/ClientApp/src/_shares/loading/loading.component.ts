import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from '@services/loading.service';

@Component({
  selector: 'ezp-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent {
  @Input() message: string
  isLoading: boolean = false;
  private subscription: Subscription;

  constructor(private loadingService: LoadingService, private changeDedectionRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.loadingService.isLoading.subscribe((data: boolean) => {
      this.isLoading = data;
    });
  }

  public ngAfterContentChecked(): void {
    this.changeDedectionRef.detectChanges();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
