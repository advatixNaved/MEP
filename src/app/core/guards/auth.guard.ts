import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService, UtilService } from '../services';

@Injectable({
    providedIn: 'root'
})
export class AuthCheckGuard implements CanActivate {
    constructor(
        private _authenticationService: AuthenticationService,
        private _utilService: UtilService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let url: string = state.url;
        return this.checkUserLogin(next);
    }
    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.checkUserLogin(next);
    }


    checkUserLogin(route: ActivatedRouteSnapshot): boolean {
        console.log('route', route);

        const currentUser = this._authenticationService.currentUserValue;
        console.log('currentUser', currentUser);

        if (currentUser) {
            const userRole = currentUser.user_type;
            if (route.data?.role && route.data?.role.indexOf(userRole) > -1) {
                return true;
            }
            this._authenticationService.logout();
            return false;
        }
        this._authenticationService.logout();
        return false;
    }

}
