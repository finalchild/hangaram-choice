import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSort, MatTableDataSource} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient} from '@angular/common/http';
import {backendUrl} from "./app.component";
import StudentsRequest from '../common/request/admin/StudentRequest';
import Student from '../common/Student';
import {CreateStudentKeysDialogComponent, toKeyWithCheckDigit} from './admin-create-student-keys-dialog.component';
import {downloadStudents} from './status';

@Component({
  selector: 'hc-students-dialog',
  templateUrl: './admin-students-dialog.component.html'
})
export class StudentsDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<StudentsDialogComponent>,
              private dialog: MatDialog,
              private adminService: AdminService,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  students: Array<Student>;
  studentsData: MatTableDataSource<Element>;
  displayedColumns = ['studentNumber', 'name', 'key', 'voted'];
  filterValue = '';

  @ViewChild(MatSort) sort: MatSort;

  create(): void {
    this.dialog.open(CreateStudentKeysDialogComponent).afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  download(): void {
    if (this.filterValue === '') {
      downloadStudents(this.students);
      return;
    }
    const predicate = (student: Student) => {
      if (this.filterValue.match(/^\d{0,5}$/)) {
        return student.studentNumber.toString(10).startsWith(this.filterValue);
      } else {
        return (student.studentNumber.toString(10) + student.name + toKeyWithCheckDigit(student.key) + (student.voted === 1 ? '투표 완료' : '투표 미완료')).includes(this.filterValue);
      }
    };
    downloadStudents(this.students.filter(predicate));
  }

  print(): void {
    const html = document.getElementById('students-dialog-table-container').innerHTML.replace(/투표 미완료/g, '').replace(/투표 완료/g, '');
    const myWindow = window.open('', 'PRINT');
    myWindow.document.write('<html><head><title>' + document.title  + '</title>');
    myWindow.document.write('<style>body { margin-top: 10px; margin-bottom: 10px; } table { font-size: 16px;} thead, th {display: none;} tr { height: 20px; } th:nth-child(1) { width: 150px; } th:nth-child(2) { width: 200px;} th:nth-child(3) { width: 200px; }</style>');
    myWindow.document.write('</head><body>');
    myWindow.document.write(html);
    myWindow.document.write('</body></html>');

    myWindow.document.close();
    myWindow.focus();

    myWindow.print();
    myWindow.close();
  }

  back(): void {
    this.dialogRef.close();
  }

  applyFilter(filterValue: string) {
    this.studentsData.filter = filterValue.trim().toLowerCase();
    this.filterValue = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.http.post<Array<Student>>(backendUrl + '/api/admin/students', {
      adminPassword: this.adminService.adminPassword
    } as StudentsRequest).subscribe(data => {
      this.students = (<Array<Student>>data).sort((a, b) => {
        if (a.studentNumber < b.studentNumber) {
          return -1;
        } else if (a.studentNumber > b.studentNumber) {
          return 1;
        } else {
          return 0;
        }
      });
      this.studentsData = new MatTableDataSource<Element>(getStudentArray(this.students));
      this.studentsData.filterPredicate = (data: Element, filter: string) => {
        if (filter.match(/^\d{0,5}$/)) {
          return data.studentNumber.startsWith(filter);
        } else {
          return (data.studentNumber + data.name + data.key + data.voted).includes(filter);
        }
      };
      this.studentsData.sort = this.sort;
    });
  }

}

function getStudentArray(students: Array<Student>): Array<Element> {
  return students.map(student => {
    return {
      name: student.name,
      studentNumber: student.studentNumber.toString(10),
      key: toKeyWithCheckDigit(student.key),
      voted: student.voted === 1 ? '투표 완료' : '투표 미완료'
    }
  });
}


export interface Element {
  name: string;
  studentNumber: string;
  key: string;
  voted: string;
}
