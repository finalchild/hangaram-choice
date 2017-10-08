import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgModel} from '@angular/forms';
import {Keys} from './keys';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import {s2ab} from './result';

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
    this.error1 = undefined;
    this.error2 = undefined;
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
    if (firstGraders < 0 || firstGraders >= 10000) {
      firstGradersModel.control.setErrors({
        invalid: true
      });
      this.error1 = '4자리 이하의 자연수를 입력해 주세요';
      firstGradersElement.focus();
      return;
    }
    if (secondGraders < 0 || secondGraders >= 10000) {
      secondGradersModel.control.setErrors({
        invalid: true
      });
      this.error2 = '4자리 이하의 자연수를 입력해 주세요';
      secondGradersElement.focus();
      return;
    }

    this.http.post<Keys>(`http://localhost:3000/api/generatekeys`, {
      adminPassword: this.adminService.adminPassword,
      firstGraders: firstGraders,
      secondGraders: secondGraders
    })
      .subscribe(data => {
        alert('키가 생성되었습니다');
        downloadKeys(data);
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

function downloadKeys(keys: Keys) {
  const firstGradeSheet = XLSX.utils.aoa_to_sheet(keys.firstGradeKeys.map(key => [key]));
  const secondGradeSheet = XLSX.utils.aoa_to_sheet(keys.secondGradeKeys.map(key => [key]));

  const workbook = {
    Sheets: {},
    SheetNames: []
  };

  workbook.SheetNames.push('1학년');
  workbook.Sheets['1학년'] = firstGradeSheet;
  workbook.SheetNames.push('2학년');
  workbook.Sheets['2학년'] = secondGradeSheet;

  const wbout = XLSX.write(workbook, {
    type: 'binary'
  });
  saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '학생키.xlsx');
}
