import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, Observable, throwError } from 'rxjs';
import { APIENDPOINTS, ApiMethods, ERROR_MESSAGE } from '../constants';
import { StorageService, UtilService } from '.';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  currentUserSubject = new BehaviorSubject<any>({});
  currentUserSubjectAsObservable = this.currentUserSubject.asObservable();
  storageEvent = fromEvent(window, 'storage');
  constructor(
    private _storageService: StorageService,
    private _utilService: UtilService,
    private _httpService: HttpService,
  ) { }

  public get currentUserValue(): any {
    return this.currentUserSubject && this.currentUserSubject.value;
  }


  login(id: any): Observable<any> {
    return this._httpService.apiCall(APIENDPOINTS.USER_LOGIN, ApiMethods.GET, {}, '', '' + id)
      .pipe(map((data: any) => {
        let loggedInTime = new Date().getTime() + '#@!';
        if (data && data.hasOwnProperty('jwt') && data.jwt != '') {
          // data.lt = loggedInTime;
          // let decodedData = this._utilService.encrypt(JSON.stringify(data))
          // this._storageService.saveToken(JSON.stringify(data));
          // let key = this._utilService.encrypt(loggedInTime);
          // this._storageService.createNewStorageKey(loggedInTime, key);
          // this.currentUserSubject.next(data);
        } else {
          return { ...data, status: 'errror' };
        }
        return { ...data, status: 'success' };
      }));

  }

  logout() {
    this._utilService.navigateTo('/auth/login');
    this._storageService.removeToken();
    localStorage.clear();
    sessionStorage.clear();
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  setLatestToken() {
        const storage = this._storageService.getToken();
        try {
            this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(storage));
            this.currentUserSubjectAsObservable = this.currentUserSubject.asObservable();
        } catch (err) {

        }
    }

  handleError(error: HttpErrorResponse): any {
    const errorResponse = { message: error?.error?.text ? error?.error?.text : error?.error?.message || ERROR_MESSAGE, statusText: error?.statusText, status: error?.status };
    return throwError(errorResponse);
  }
}
