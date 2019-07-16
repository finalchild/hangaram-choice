import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {NgModel} from '@angular/forms';
import XLSX from 'xlsx-populate/browser/xlsx-populate';
import {saveAs} from 'file-saver';
import {mod10} from 'checkdigit';
import GenerateKeysRequest from '../common/request/admin/GenerateKeysRequest';
import Keys from '../common/Keys';
import {backendUrl} from "./app.component";
import StudentInfoes from '../common/StudentInfoes';
import StudentInfo from '../common/StudentInfo';

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

  onYesClick(inputFile: HTMLInputElement, inputFileControl: NgModel) {
    const file = inputFile.files[0];
    readFileContent(file).then((content) => {
      const studentInfoes = readStudentInfoes(content);
      this.http.post<Keys>(backendUrl + '/api/admin/generatekeys', {
        adminPassword: this.adminService.adminPassword,
        studentInfoes
      } as GenerateKeysRequest)
        .subscribe(data => {
          alert('키가 생성되었습니다');
          this.dialogRef.close();
        }, err => {
          if (err instanceof HttpErrorResponse) {
            inputFileControl.control.setErrors({
              couldNotLogin: true
            });
            this.error1 = err.error;
            inputFile.focus();
          } else {
            console.log(err);
          }
        });
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

function readStudentInfoes(text: string): StudentInfoes {
  const split = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const firstGradeStudentInfoes = [];
  const secondGradeStudentInfoes = [];
  const thirdGradeStudentInfoes = [];
  let currentGrade = 1;
  let currentClass = 1;
  let currentNumber = 1;
  for (let s of split) {
    if (s.match(/^\d/)) {
      if (s.length === 1) {
        currentClass = parseInt(s, 10);
        currentNumber = 1;
      } else {
        currentGrade = parseInt(s.charAt(0), 10);
        currentClass = 1;
        currentNumber = 1;
      }
    } else if (s.length === 0) {
      currentNumber++;
    } else {
      switch (currentGrade) {
        case 1:
          firstGradeStudentInfoes.push({
            name: s,
            studentNumber: currentGrade * 10000 + currentClass * 100 + currentNumber
          } as StudentInfo);
          currentNumber++;
          break;
        case 2:
          secondGradeStudentInfoes.push({
            name: s,
            studentNumber: currentGrade * 10000 + currentClass * 100 + currentNumber
          } as StudentInfo);
          currentNumber++;
          break;
        case 3:
          thirdGradeStudentInfoes.push({
            name: s,
            studentNumber: currentGrade * 10000 + currentClass * 100 + currentNumber
          } as StudentInfo);
          currentNumber++;
      }
    }
  }
  return {
    firstGradeStudentInfoes,
    secondGradeStudentInfoes,
    thirdGradeStudentInfoes
  } as StudentInfoes;
}

async function readFileContent(file): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  }) as Promise<string>;
}

/*
async function downloadKeys(keys: Keys, studentInfoes: StudentInfoes): Promise<void> {
  const workbook = await XLSX.fromBlankAsync();
  const firstGradeSheet = workbook.addSheet('1학년');
  const secondGradeSheet = workbook.addSheet('2학년');
  const thirdGradeSheet = workbook.addSheet('3학년');
  workbook.deleteSheet(0);

  for (let i = 0; i < keys.firstGradeKeys.length; i++) {
    firstGradeSheet.row(i + 1).cell(1).value(studentInfoes.firstGradeStudentInfoes[i].studentNumber);
    firstGradeSheet.row(i + 1).cell(2).value(studentInfoes.firstGradeStudentInfoes[i].name);
    firstGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(keys.firstGradeKeys[i]));
  }
  for (let i = 0; i < keys.secondGradeKeys.length; i++) {
    secondGradeSheet.row(i + 1).cell(1).value(studentInfoes.secondGradeStudentInfoes[i].studentNumber);
    secondGradeSheet.row(i + 1).cell(2).value(studentInfoes.secondGradeStudentInfoes[i].name);
    secondGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(keys.secondGradeKeys[i]));
  }
  for (let i = 0; i < keys.thirdGradeKeys.length; i++) {
    thirdGradeSheet.row(i + 1).cell(1).value(studentInfoes.thirdGradeStudentInfoes[i].studentNumber);
    thirdGradeSheet.row(i + 1).cell(2).value(studentInfoes.thirdGradeStudentInfoes[i].name);
    thirdGradeSheet.row(i + 1).cell(3).value(toKeyWithCheckDigit(keys.thirdGradeKeys[i]));
  }

  const wbout = await workbook.outputAsync();
  saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '학생키.xlsx');
}
*/

export function toKeyWithCheckDigit(key: number): string {
  const s = key.toString(10);
  return s.padStart(7, '0') + mod10.create(s);
}
