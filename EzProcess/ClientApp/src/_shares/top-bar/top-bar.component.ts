import { Component } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'ezp-top-bar',
    templateUrl: './top-bar.component.html'
})
export class TopBarComponent {

    isUserLoggedIn: boolean;

    constructor(private authService: AuthService) {

    }

    ngOnInit() {
        this.isUserLoggedIn = this.authService.isLoggedIn;
    }

    logout() {
        this.authService.logout();
        this.isUserLoggedIn = this.authService.isLoggedIn;
        this.authService.redirectLogoutUser();
    }
}
