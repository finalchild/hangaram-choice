import {Component} from '@angular/core';
import {NgModel} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {AdminService} from './admin.service';
import {Status} from './status';
import {MdIconRegistry} from '@angular/material';

@Component({
  selector: 'hc-admin-login',
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {

  constructor(public adminService: AdminService,
              private router: Router,
              private http: HttpClient,
              iconRegistry: MdIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('account_circle', sanitizer.bypassSecurityTrustResourceUrl('assets/img/account_circle.svg'));
  }

  error: string = undefined;

  onLogin(passwordElement: HTMLInputElement, model: NgModel) {
    if (!passwordElement.value || passwordElement.value === '') {
      model.control.setErrors({
        empty: true
      });
      this.error = '관리자 비밀번호를 입력해 주세요';
      passwordElement.focus();
      return;
    }
    const adminPassword = passwordElement.value;
    if (!isValidAdminPassword(adminPassword)) {
      model.control.setErrors({
        invalid: true
      });
      this.error = '비밀번호는 20자 이내여야 합니다';
      passwordElement.focus();
      return;
    }

    this.http.post(`http://localhost:3000/api/admin/status`, {
      adminPassword: adminPassword
    })
      .subscribe(data => {
        this.adminService.adminPassword = adminPassword;
        this.adminService.result = <Status>data;
        this.router.navigate(['/admin/result']);
      }, err => {
        if (err instanceof HttpErrorResponse) {
          model.control.setErrors({
            couldNotLogin: true
          });
          this.error = JSON.parse(err.error)['message'];
          passwordElement.focus();
        } else {
          console.log(err);
        }
      });
  }

}

export function isValidAdminPassword(adminPassword) {
  return typeof adminPassword === 'string' && adminPassword.length <= 20;
}
