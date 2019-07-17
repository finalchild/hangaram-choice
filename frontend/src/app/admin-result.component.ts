import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {MatDialog, MatIconRegistry, MatTableDataSource} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {DomSanitizer} from '@angular/platform-browser';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';
import OpenPollRequest from '../common/request/admin/OpenPollRequest';
import ClosePollRequest from '../common/request/admin/ClosePollRequest';
import {ListOldPollsDialogComponent} from './admin-list-old-polls-dialog.component';
import {backendUrl} from './app.component';
import {forChart} from './forChart';
import {StudentsDialogComponent} from './admin-students-dialog.component';
import {DetailArgument, VoteDetailDialogComponent} from './admin-vote-detail-dialog.component';
import Status from '../common/Status';
import {downloadResultImpl} from './status';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(public adminService: AdminService,
              private dialog: MatDialog,
              private http: HttpClient,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('refresh', sanitizer.bypassSecurityTrustResourceUrl('assets/img/refresh.svg'));
  }

  results1M = forChart(this.adminService.status.candidates.candidates1M);
  results1F = forChart(this.adminService.status.candidates.candidates1F);
  results2 = forChart(this.adminService.status.candidates.candidates2);

  turnoutColumns = ['name', 'firstGrade', 'secondGrade', 'thirdGrade'];
  turnoutDataSource: MatTableDataSource<Element> = new MatTableDataSource<Element>(getTurnoutElementArray(this.adminService.status));

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#333399', '#336633', '#FF66FF', '#CC66CC', '#FFCCFF']
  };

  openCreateStudentKeysDialog(): void {
    this.dialog.open(CreateStudentKeysDialogComponent);
  }

  openChangeAdminPasswordDialog(): void {
    this.dialog.open(ChangeAdminPasswordDialogComponent);
  }

  viewStudents(): void {
    this.dialog.open(StudentsDialogComponent);
  }

  downloadResult(): void {
    downloadResultImpl(this.adminService.status);
  }

  refresh(): void {
    this.adminService.refreshResult().then(() => {
      this.results1M = forChart(this.adminService.status.candidates.candidates1M);
      this.results1F = forChart(this.adminService.status.candidates.candidates1F);
      this.results2 = forChart(this.adminService.status.candidates.candidates2);
      this.turnoutDataSource = new MatTableDataSource(getTurnoutElementArray(this.adminService.status));
    });
  }

  openPoll(): void {
    this.http.post(backendUrl + '/api/admin/openpoll', {
      adminPassword: this.adminService.adminPassword
    } as OpenPollRequest).subscribe(data => {
      alert('설정된 대로 투표를 열었습니다!');
      this.refresh();
    });
  }

  closePoll(): void {
    this.http.post(backendUrl + '/api/admin/closepoll', {
      adminPassword: this.adminService.adminPassword
    } as ClosePollRequest).subscribe(data => {
      alert('투표를 닫았습니다!');
      this.refresh();
    });
  }

  openInitializeDialog(): void {
    this.dialog.open(InitializeDialogComponent);
  }

  openListOldPollDialog(): void {
    this.dialog.open(ListOldPollsDialogComponent);
  }

  details2() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '2학년 회장단 투표',
        type: '2',
        photoBaseUrl: '/students/' + encodeURIComponent(this.adminService.status.pollName) + '/',
        status: this.adminService.status
      } as DetailArgument
    });
  }

  details1M() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '1학년 남자 부회장 투표',
        type: '1M',
        photoBaseUrl: '/students/' + encodeURIComponent(this.adminService.status.pollName) + '/',
        status: this.adminService.status
      } as DetailArgument
    });
  }

  details1F() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '1학년 여자 부회장 투표',
        type: '1F',
        photoBaseUrl: '/students/' + encodeURIComponent(this.adminService.status.pollName) + '/',
        status: this.adminService.status
      } as DetailArgument
    });
  }

}

export function getTurnoutElementArray(status: Status): Array<Element> {
  return [
    {
      name: '투표 완료',
      firstGrade: status.keyStatus.numberOfFirstGradeVotedKeys.toString(10),
      secondGrade: status.keyStatus.numberOfSecondGradeVotedKeys.toString(10),
      thirdGrade: status.keyStatus.numberOfThirdGradeVotedKeys.toString(10)
    },
    {
      name: '미투표',
      firstGrade: status.keyStatus.numberOfFirstGradeNotVotedKeys.toString(10),
      secondGrade: status.keyStatus.numberOfSecondGradeNotVotedKeys.toString(10),
      thirdGrade: status.keyStatus.numberOfThirdGradeNotVotedKeys.toString(10)
    },
    {
      name: '총계',
      firstGrade: (status.keyStatus.numberOfFirstGradeVotedKeys
        + status.keyStatus.numberOfFirstGradeNotVotedKeys)
        .toString(10),
      secondGrade: (status.keyStatus.numberOfSecondGradeVotedKeys
        + status.keyStatus.numberOfSecondGradeNotVotedKeys)
        .toString(10),
      thirdGrade: (status.keyStatus.numberOfThirdGradeVotedKeys
        + status.keyStatus.numberOfThirdGradeNotVotedKeys)
        .toString(10)
    }
  ];
}

export interface Element {
  name: string;
  firstGrade: string;
  secondGrade: string;
  thirdGrade: string;
}

