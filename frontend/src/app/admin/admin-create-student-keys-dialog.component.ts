import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgModel} from '@angular/forms';
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver';
import {s2ab} from './status';
import {mod10} from 'checkdigit';
import GenerateKeysRequest from '../../common/request/admin/GenerateKeysRequest';
import Keys from '../../common/Keys';
import {backendUrl} from "../app.component";

@Component({
  selector: 'hc-create-student-keys-dialog',
  templateUrl: './admin-create-student-keys-dialog.component.html',
})
export class CreateStudentKeysDialogComponent {

  constructor(private dialogRef: MatDialogRef<CreateStudentKeysDialogComponent>,
              private adminService: AdminService,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  error1: string;
  error2: string;
  error3: string;

  onYesClick(firstGradersElement: HTMLInputElement,
             firstGradersModel: NgModel,
             secondGradersElement: HTMLInputElement,
             secondGradersModel: NgModel,
             thirdGradersElement: HTMLInputElement,
             thirdGradersModel: NgModel) {
    this.error1 = undefined;
    this.error2 = undefined;
    this.error3 = undefined;
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
    if (!thirdGradersElement.value || thirdGradersElement.value === '') {
      thirdGradersModel.control.setErrors({
        empty: true
      });
      this.error3 = '생성할 3학년 키 개수를 입력해 주세요';
      thirdGradersElement.focus();
      return;
    }
    const firstGraders = parseInt(firstGradersElement.value, 10);
    const secondGraders = parseInt(secondGradersElement.value, 10);
    const thirdGraders = parseInt(thirdGradersElement.value, 10);
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
    if (thirdGraders < 0 || thirdGraders >= 10000) {
      thirdGradersModel.control.setErrors({
        invalid: true
      });
      this.error3 = '4자리 이하의 자연수를 입력해 주세요';
      thirdGradersElement.focus();
      return;
    }

    this.http.post<Keys>(backendUrl + '/api/admin/generatekeys', {
      adminPassword: this.adminService.adminPassword,
      firstGraders: firstGraders,
      secondGraders: secondGraders,
      thirdGraders: thirdGraders
    } as GenerateKeysRequest)
      .subscribe(data => {
        alert('키가 생성되었습니다');
        downloadKeys(data);
        this.dialogRef.close();
      }, err => {
        if (err instanceof HttpErrorResponse) {
          firstGradersModel.control.setErrors({
            couldNotLogin: true
          });
          this.error1 = err.error;
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

function downloadKeys(keys: Keys): void {
  const firstGradeSheet = XLSX.utils.aoa_to_sheet(keys.firstGradeKeys.map(key => [toKeyWithCheckDigit(key)]));
  const secondGradeSheet = XLSX.utils.aoa_to_sheet(keys.secondGradeKeys.map(key => [toKeyWithCheckDigit(key)]));
  const thirdGradeSheet = XLSX.utils.aoa_to_sheet(keys.thirdGradeKeys.map(key => [toKeyWithCheckDigit(key)]));

  const workbook = {
    Sheets: {},
    SheetNames: []
  };

  workbook.SheetNames.push('1학년');
  workbook.Sheets['1학년'] = firstGradeSheet;
  workbook.SheetNames.push('2학년');
  workbook.Sheets['2학년'] = secondGradeSheet;
  workbook.SheetNames.push('3학년');
  workbook.Sheets['3학년'] = thirdGradeSheet;

  const wbout = XLSX.write(workbook, {
    type: 'binary'
  });
  saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), '학생키.xlsx');
}

function toKeyWithCheckDigit(key: number): string {
  const s = key.toString(10);
  return s.padStart(7, '0') + mod10.create(s);
}
