import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgModel} from '@angular/forms';
import {isValidAdminPassword} from './admin-login.component';

@Component({
  selector: 'hc-change-admin-password-dialog',
  templateUrl: './admin-change-admin-password-dialog.component.html',
})
export class ChangeAdminPasswordDialogComponent {

  constructor(
    private dialogRef: MdDialogRef<ChangeAdminPasswordDialogComponent>,
    private adminService: AdminService,
    private http: HttpClient,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  error: string;

  onYesClick(passwordElement: HTMLInputElement, model: NgModel) {
    if (!passwordElement.value || passwordElement.value === '') {
      model.control.setErrors({
        empty: true
      });
      this.error = '변경할 관리자 비밀번호를 입력해 주세요';
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

    this.http.post(`http://localhost:3000/api/setadminpw`, {
      adminPassword: this.adminService.adminPassword,
      newAdminPassword: adminPassword
    })
      .subscribe(data => {
        this.adminService.adminPassword = adminPassword;
        alert(data['message']);
        this.dialogRef.close();
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

  onNoClick(): void {
    this.dialogRef.close();
  }

}
