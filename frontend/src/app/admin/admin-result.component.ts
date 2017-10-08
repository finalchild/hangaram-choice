import {Component, Inject} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate} from './result';
import {MD_DIALOG_DATA, MdDialog, MdDialogRef} from '@angular/material';
import {NgModel} from '@angular/forms';
import {isValidAdminPassword} from './admin-login.component';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService, private dialog: MdDialog, private http: HttpClient) {}

  results1M = forChart(this.adminService.result.candidates1M);
  results1F = forChart(this.adminService.result.candidates1F);
  results2 = forChart(this.adminService.result.candidates2);

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  openChangeAdminPasswordDialog() {
    const dialogRef = this.dialog.open(ChangeAdminPasswordDialogComponent, {
      width: '250px'
    });
  }
}

function forChart(candidates: Array<Candidate>): Array<{name: string, value: number}> {
  return candidates.map(function(candidate: Candidate): {name: string, value: number} {
    return {
      name: candidate.name,
      value: candidate.votes
    };
  });
}

@Component({
  selector: 'hc-change-admin-password-dialog',
  templateUrl: './hc-change-admin-password-dialog.html',
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
        console.log('password changed to ' + this.adminService.adminPassword);
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
