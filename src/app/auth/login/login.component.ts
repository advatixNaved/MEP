import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService, UtilService } from '../../core/services';
import { ERROR_MESSAGE, REQUIRED_FIELDS, ToasterTitle, ToasterType } from '../../core/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formGroup!: FormGroup;
  passwordToggler!: boolean;
  serviceSubscription: Subscription[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _utilService: UtilService,
    private _authServive: AuthenticationService
  ) {
    this.passwordToggler = true;
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.formGroup = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  passwordTogglerFun() {
    this.passwordToggler = !this.passwordToggler;
  }

  onSubmit(): void {
    if (!this.formGroup.valid) {
      this._utilService.showToaster(ToasterType.WARNING, ToasterTitle.WARNING, REQUIRED_FIELDS);
      this.formGroup.markAllAsTouched();
      return;
    } else {
      const formData = this.formGroup.value;
      const payload: any = {
        "userName": formData?.username,
        "password": formData.password
      };

      this._utilService.showLoader();
      this.serviceSubscription.push(
        this._authServive.login(payload).subscribe(
          (response) => {
            this._utilService.hideLoader();
            if (response) {
              this._utilService.showToaster(ToasterType.SUCCESS, ToasterTitle.SUCCESS, response?.message)
              this._utilService.navigateTo('/private/store/list');
            }
          },
          (error) => {
            this._utilService.hideLoader();
            let message = error?.message ? error.message : ERROR_MESSAGE;
            this._utilService.showToaster(ToasterType.ERROR, ToasterTitle.ERROR, message);
          }
        )
      )
    }
  }
}
