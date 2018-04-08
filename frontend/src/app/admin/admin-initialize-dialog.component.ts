import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatIconRegistry} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {AdminService} from './admin.service';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {DomSanitizer} from '@angular/platform-browser';
import InitializePollRequest from '../../common/request/admin/InitializePollRequest';
import {backendUrl} from "../app.component";

@Component({
  selector: 'hc-admin-initialize-dialog',
  templateUrl: './admin-initialize-dialog.component.html',
})
export class InitializeDialogComponent {

  constructor(private dialogRef: MatDialogRef<InitializeDialogComponent>,
              private dialog: MatDialog,
              private http: HttpClient,
              private adminService: AdminService,
              iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    iconRegistry.addSvgIcon(
      'clear',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/clear.svg'));
  }

  pollName = '한가람고등학교 학생회장단 선거';
  candidateNames1M: string;
  candidateNames1F: string;
  candidateNames2: string;
  error1M: string;
  error1F: string;
  error2: string;

  onYesClick() {
    // TODO 좀 더 간결한 체크
    this.error1M = undefined;
    this.error1F = undefined;
    this.error2 = undefined;
    let fail = false;
    if (!this.candidateNames1M) {
      this.error1M = '필수 항목입니다';
      fail = true;
    }
    if (!this.candidateNames1F) {
      this.error1F = '필수 항목입니다';
      fail = true;
    }
    if (!this.candidateNames2) {
      this.error2 = '필수 항목입니다';
      fail = true;
    }
    if (fail) {
      return;
    }

    const split1M = this.candidateNames1M.split('\n');
    for (const e in split1M) {
      if (e === '') {
        this.error1M = '빈 줄이 있습니다!';
        fail = true;
      }
    }
    const split1F = this.candidateNames1F.split('\n');
    for (const e in split1F) {
      if (e === '') {
        this.error1F = '빈 줄이 있습니다!';
        fail = true;
      }
    }
    const split2 = this.candidateNames2.split('\n');
    for (const e in split2) {
      if (e === '') {
        this.error2 = '빈 줄이 있습니다!';
        fail = true;
      }
    }
    if (fail) {
      return;
    }

    this.http.post(backendUrl + '/api/admin/initializepoll', {
      adminPassword: this.adminService.adminPassword,
      pollName: this.pollName,
      candidateNames: {
        candidateNames1M: this.candidateNames1M.split('\n'),
        candidateNames1F: this.candidateNames1F.split('\n'),
        candidateNames2: this.candidateNames2.split('\n')
      }
    } as InitializePollRequest).subscribe(data => {
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
