import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'hc-create-student-keys-dialog',
  templateUrl: './admin-create-student-keys-dialog.component.html',
})
export class CreateStudentKeysDialogComponent {

  constructor(
    private dialogRef: MdDialogRef<CreateStudentKeysDialogComponent>,
    private adminService: AdminService,
    private http: HttpClient,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  error1: string;
  error2: string;

  onYesClick(firstGradersElement: HTMLInputElement,
             firstGradersModel: NgModel,
             secondGradersElement: HTMLInputElement,
             secondGradersModel: NgModel) {
    if (!firstGradersElement.value || firstGradersElement.value === '') {
      firstGradersModel.control.setErrors({
        empty: true
      });
      this.error1 = '생성할 1학년 키 개수를 입력해 주세요';
      firstGradersElement.focus();
      return;
    }
    if (!secondGradersElement.value || secondGradersElement.value === '') {
      secondGradersModel.control.setErrors({
        empty: true
      });
      this.error2 = '생성할 2학년 키 개수를 입력해 주세요';
      secondGradersElement.focus();
      return;
    }
    const firstGraders = parseInt(firstGradersElement.value, 10);
    const secondGraders = parseInt(secondGradersElement.value, 10);

    this.http.post(`http://localhost:3000/api/generatekeys`, {
      adminPassword: this.adminService.adminPassword,
      firstGraders: firstGraders,
      secondGraders: secondGraders
    })
      .subscribe(data => {
        alert('키가 생성되었습니다. TODO: Excel 파일로 다운로드.');
        console.log(data);
        this.dialogRef.close();
      }, err => {
        if (err instanceof HttpErrorResponse) {
          firstGradersModel.control.setErrors({
            couldNotLogin: true
          });
          this.error1 = JSON.parse(err.error)['message'];
          firstGradersElement.focus();
        } else {
          console.log(err);
        }
      });

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
