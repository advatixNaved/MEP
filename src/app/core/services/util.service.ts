import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private _router: Router,
    private spinner: NgxSpinnerService,
    private messageService: MessageService
  ) { }

  showLoader(): void {
    this.spinner.show();
  }

  hideLoader(): void {
    this.spinner.hide();
  }

  navigateTo(url: string): void {
    this._router.navigateByUrl(url);
  }

  showToaster(type: string, title: string, description: string) {
    this.messageService.add({ severity: type, summary: title, detail: description, life: 5000 });
  }

}
