import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SlideComponent } from '@shares/slide/slide.component';
import { LoadingComponent } from '@shares/loading/loading.component';
import { TopBarComponent } from '@shares/top-bar/top-bar.component';
import { NavBarComponent } from '@shares/nav-bar/nav-bar.component';

/* prime-ng components */
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';

/* 3rd party components */
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SearchBoxComponent } from './search-box/search-box.component';

/* pipes */
import { GroupByPipe } from '@pipes/group-by.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, ToastModule, MessageModule, MessagesModule, TooltipModule, TabViewModule,
        TabMenuModule, CardModule, MultiSelectModule, BadgeModule, DialogModule, ConfirmDialogModule, TableModule,
        ConfirmPopupModule, MenuModule, DropdownModule,
        CarouselModule
    ],
    declarations: [
        SlideComponent, GroupByPipe,
        LoadingComponent,
        TopBarComponent, NavBarComponent, SearchBoxComponent
    ],
    exports: [
        CommonModule, GroupByPipe,
        FormsModule, ReactiveFormsModule, RouterModule,
        SlideComponent, LoadingComponent, TopBarComponent, NavBarComponent, SearchBoxComponent,
        InputTextModule, ButtonModule, ToastModule, MessageModule, MessagesModule, TooltipModule, TabViewModule,
        TabMenuModule, CardModule, MultiSelectModule, BadgeModule, DialogModule, ConfirmDialogModule, TableModule,
        ConfirmPopupModule, MenuModule, DropdownModule,
        CarouselModule
    ]
})
export class SharesModule { }
