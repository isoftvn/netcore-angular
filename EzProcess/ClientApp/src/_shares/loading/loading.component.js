"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingComponent = void 0;
var core_1 = require("@angular/core");
var LoadingComponent = /** @class */ (function () {
    function LoadingComponent(loadingService, changeDedectionRef) {
        this.loadingService = loadingService;
        this.changeDedectionRef = changeDedectionRef;
        this.isLoading = false;
    }
    LoadingComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.loadingService.isLoading.subscribe(function (data) {
            _this.isLoading = data;
        });
    };
    LoadingComponent.prototype.ngAfterContentChecked = function () {
        this.changeDedectionRef.detectChanges();
    };
    LoadingComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    __decorate([
        core_1.Input()
    ], LoadingComponent.prototype, "message", void 0);
    LoadingComponent = __decorate([
        core_1.Component({
            selector: 'loading',
            templateUrl: './loading.component.html',
            styleUrls: ['./loading.component.scss']
        })
    ], LoadingComponent);
    return LoadingComponent;
}());
exports.LoadingComponent = LoadingComponent;
//# sourceMappingURL=loading.component.js.map