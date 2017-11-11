import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA, MdDialog, MdDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {AdminService} from './admin.service';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';

@Component({
  selector: 'hc-admin-initialize-dialog',
  templateUrl: './admin-initialize-dialog.component.html',
})
export class InitializeDialogComponent {

  constructor(
    private dialogRef: MdDialogRef<InitializeDialogComponent>,
    private dialog: MdDialog,
    private http: HttpClient,
    private adminService: AdminService,
    @Inject(MD_DIALOG_DATA) public data: any) {}

  pollName = '한가람고등학교 학생회장단 선거';
  candidateNames1M: string;
  candidateNames1F: string;
  candidateNames2: string;

  onYesClick() {
    console.log(this.adminService.adminPassword);
    this.http.post('http://localhost:3000/api/admin/initializepoll', {
      adminPassword: this.adminService.adminPassword,
      poll: {
        pollName: this.pollName,
        candidateNames1M: this.candidateNames1M.split('\n'),
        candidateNames1F: this.candidateNames1F.split('\n'),
        candidateNames2: this.candidateNames2.split('\n')
      }
    }).subscribe(data => {
      alert(data['message']);
      this.dialogRef.close();
      this.dialog.open(CreateStudentKeysDialogComponent);
    }, err => {
      console.log(err);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
