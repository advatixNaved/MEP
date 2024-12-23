import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RetryBackoffConfig } from 'backoff-rxjs';
import { BehaviorSubject, Observable, defer, iif, of, throwError, timer } from 'rxjs';
import { catchError, concatMap, filter, finalize, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { SESSION_EXPIRED, SOMETHING_WENT_WRONG_TRY_AGAIN, ToasterTitle, ToasterType } from '../constants';
import { AuthenticationService, BackOffService, StorageService, UtilService } from '../services';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    auth: any;
    currentUser: any;
    isLoggedIn: any;
    isRefreshing: boolean = false;
    constructor(
        private _authenticationService: AuthenticationService,
        private _http: HttpClient,
        private _backoffService: BackOffService,
        private _storageService: StorageService,
        private _utilService: UtilService
    ) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        this.currentUser = this._authenticationService.currentUserValue;
        this.isLoggedIn = this.currentUser && this.currentUser.jwt;
        if (this.isLoggedIn) {
            if (request.url.indexOf('geocode') == -1) {
                if (request.url.indexOf('refreshToken') > -1) {
                    const refresh_token = this.currentUser?.refresh_token;
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${refresh_token}`,
                        },
                    });
                } else {
                    let token = this.currentUser.jwt;
                    request = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }

            }

        }
        return next.handle(request).pipe(
            //retryBackoff(expRetryConfig, this._backoffService),
            catchError((error: HttpErrorResponse) => {
                return this.handle401Error(error, request, next);
            }));
        //catchError((error) => this.handleHttpError(error, request, next)),
    }

    private handleHttpError(error: any | Response, request: HttpRequest<any>, next: HttpHandler) {
        if (error.status === 401) {
            if (request.url.indexOf('refreshToken') > -1) {
                // this._authenticationService.logout();
                let message = SESSION_EXPIRED;
                this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, message);
                this._utilService.hideLoader();
                return error.status == 401 ? throwError(error) : of(error);
            }
            const refresh_token = this.currentUser?.refresh_token;

            if (refresh_token && !this.isRefreshing) {
                this.isRefreshing = true;
                const url = `${''}/${this.currentUser.user_type ? 'user' : 'user'}/refreshToken`;
                return this._http
                    .post<any>(url, {})
                    .pipe(
                        switchMap(res => {
                            if (res) {
                                this._storageService.updateToken(res?.access_token, res?.jwt, res?.refresh_token);
                                return res;
                            }
                            // else {
                            //   this._authenticationService.logout();
                            // }
                        }), switchMap((newToken: any) => {

                            let cloned = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${newToken.jwt}`,
                                },
                            });

                            return next.handle(cloned).pipe(catchError((error) => {
                                // this._authenticationService.logout();
                                return throwError(error);
                            })


                            );
                        }),
                        catchError((error) => {
                            console.log("refresh_token 2", error, error.subscribe((d: any) => { console.log("refresh_token 2", d) }))
                            // this._authenticationService.logout();
                            return throwError(error);
                        }), finalize(() => {
                            this.isRefreshing = false;
                        }),
                    );
            } else {
                // this._authenticationService.logout();
            }
        } else if (error.status === 400) {
            if (error.error?.message) {
                this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, error.error?.message);
            }
        } else if (error.status === 0 || error.status === 404) {

            this._utilService.hideLoader();
            this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, error?.message ? error.message : SOMETHING_WENT_WRONG_TRY_AGAIN);
        }

        return error.status > 399 ? throwError(error) : of(error);
    }
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private handle401Error(error: any | Response, request: HttpRequest<any>, next: HttpHandler) {
        if (error.status === 401) {
            if (request.url.indexOf('refreshToken') > -1) {
                // this._authenticationService.logout();
                let message = SESSION_EXPIRED;
                this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, message);
                this._utilService.hideLoader();
                return error.status == 401 ? throwError(error) : of(error);
            }
            else if (!this.isRefreshing) {
                this.isRefreshing = true;
                this.refreshTokenSubject.next(null);
                const url = `${''}/${this.currentUser.user_type ? 'user' : 'user'}/refreshToken`;
                return this._http
                    .post<any>(url, {})
                    .pipe(
                        switchMap((res: any) => {
                            this._storageService.updateToken(res?.access_token, res?.jwt, res?.refresh_token);
                            this.isRefreshing = false;
                            this.refreshTokenSubject.next(res.access_token);
                            return next.handle(this.addTokenHeader(request));
                        }),
                        catchError((err) => {
                            this.isRefreshing = false;
                            return throwError(error);
                        })
                    );
            } else {
                return this.refreshTokenSubject.pipe(
                    filter(token => token !== null),
                    take(1),
                    switchMap((token) => next.handle(this.addTokenHeader(request)))
                );
                // this._authenticationService.logout();
            }

        } else if (error.status === 400) {
            if (error.error?.message) {
                this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, error.error?.message);
                return throwError(error);
            }
        } else if (error.status === 0 || error.status === 404) {
            this._utilService.hideLoader();
            this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, error?.message ? error.message : SOMETHING_WENT_WRONG_TRY_AGAIN);
            return throwError(error);
        } else {
            return throwError(error);


        }
        return error.status > 399 ? throwError(error) : of(error);
    }

    private addTokenHeader(request: HttpRequest<any>) {
        this._authenticationService.setLatestToken();
        this.currentUser = this._authenticationService.currentUserValue;
        this.isLoggedIn = this.currentUser && this.currentUser.jwt;

        if (this.isLoggedIn) {
            return request = request.clone({
                setHeaders: {
                    'Authorization': `Bearer ${this.currentUser.jwt}`
                }
            })
        } else {
            return request;
        }
    }
}


export function retryBackoff(
    config: number | RetryBackoffConfig,
    backoffService: BackOffService,
): <T>(source: Observable<T>) => Observable<T> {
    const {
        initialInterval,
        maxRetries = Infinity,
        maxInterval = Infinity,
        shouldRetry = () => true,
        resetOnSuccess = false,
        backoffDelay = exponentialBackoffDelay,
    } = typeof config === 'number' ? { initialInterval: config } : config;
    return <T>(source: Observable<T>) =>
        defer(() => {
            let index = 0;
            return source.pipe(
                retryWhen<T>((errors) =>
                    errors.pipe(
                        concatMap((error) => {
                            const attempt = index++;
                            const nextRetryInterval = getDelay(backoffDelay(attempt, initialInterval), maxInterval);
                            return iif(
                                () => {
                                    const retry = attempt < maxRetries && shouldRetry(error);

                                    if (retry) {
                                        backoffService.updateBackOffStatus('retrying', nextRetryInterval);
                                    }

                                    return retry && backoffService.backoffEnabled;
                                },
                                timer(nextRetryInterval),
                                throwError(error),
                            );
                        }),
                        tap({ error: () => backoffService.updateBackOffStatus('fail', 0) }),
                    ),
                ),
                tap({
                    complete: () => {
                        index > 0 && backoffService.updateBackOffStatus('success', 0);
                    },
                }),
            );
        });
}
/** Calculates the actual delay which can be limited by maxInterval */
export function getDelay(backoffDelay: number, maxInterval: number) {
    return Math.min(backoffDelay, maxInterval);
}

/** Exponential backoff delay */
export function exponentialBackoffDelay(iteration: number, initialInterval: number) {
    return Math.pow(2, iteration) * initialInterval;
}
