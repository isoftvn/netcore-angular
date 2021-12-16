import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home.routing.module'
import { SharesModule } from '@shares/shares.module';

import { ServiceComponent } from './controls/service/service.component';
import { LatestNewsComponent } from './controls/latest-news/latest-news.component';
import { IndexComponent } from './index.component';
import { LoginComponent } from './login/login.component';

@NgModule({
    imports: [
        SharesModule,
        HomeRoutingModule
    ],
    declarations: [
        ServiceComponent,
        LatestNewsComponent,
        IndexComponent,
        LoginComponent
    ],
    exports: [
    ]
})
export class HomeModule { }
