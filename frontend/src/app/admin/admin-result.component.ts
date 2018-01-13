import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate, downloadResult} from './status';
import {MatDialog, MatIconRegistry, MatTableDataSource} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {DomSanitizer} from '@angular/platform-browser';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';
import OpenPollRequest from '../../common/request/admin/OpenPollRequest';
import ClosePollRequest from '../../common/request/admin/ClosePollRequest';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService,
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
  turnoutDataSource: MatTableDataSource<Element> = new MatTableDataSource<Element>(getTurnoutElementArray(this.adminService));

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#333399', '#336633', '#FF66FF', '#CC66CC', '#FFCCFF']
  };

  openCreateStudentKeysDialog(): void {
    this.dialog.open(CreateStudentKeysDialogComponent);
  }

  openChangeAdminPasswordDialog(): void {
    this.dialog.open(ChangeAdminPasswordDialogComponent);
  }

  downloadResult(): void {
    downloadResult(this.adminService.status);
  }

  refresh() {
    this.adminService.refreshResult().then(() => {
      this.results1M = forChart(this.adminService.status.candidates.candidates1M);
      this.results1F = forChart(this.adminService.status.candidates.candidates1F);
      this.results2 = forChart(this.adminService.status.candidates.candidates2);
      this.turnoutDataSource = new MatTableDataSource(getTurnoutElementArray(this.adminService));
    });
  }

  openPoll() {
    this.http.post('http://localhost:3000/api/admin/openpoll', {
      adminPassword: this.adminService.adminPassword
    } as OpenPollRequest).subscribe(data => {
      alert('설정된 대로 투표를 열었습니다!');
      this.refresh();
    });
  }

  closePoll() {
    this.http.post('http://localhost:3000/api/admin/closepoll', {
      adminPassword: this.adminService.adminPassword
    } as ClosePollRequest).subscribe(data => {
      alert('투표를 닫았습니다!');
      this.refresh();
    });
  }

  openInitializeDialog() {
    this.dialog.open(InitializeDialogComponent);
  }

}

function forChart(candidates: Array<Candidate>): Array<{ name: string, value: number }> {
  return candidates.map(function (candidate: Candidate): { name: string, value: number } {
    return {
      name: candidate.name,
      value: candidate.votes
    };
  });
}

function getTurnoutElementArray(adminService: AdminService): Array<Element> {
  return [
    {
      name: '투표 완료',
      firstGrade: adminService.status.keyStatus.numberOfFirstGradeVotedKeys.toString(10),
      secondGrade: adminService.status.keyStatus.numberOfSecondGradeVotedKeys.toString(10),
      thirdGrade: adminService.status.keyStatus.numberOfThirdGradeVotedKeys.toString(10)
    },
    {
      name: '미투표',
      firstGrade: adminService.status.keyStatus.numberOfFirstGradeNotVotedKeys.toString(10),
      secondGrade: adminService.status.keyStatus.numberOfSecondGradeNotVotedKeys.toString(10),
      thirdGrade: adminService.status.keyStatus.numberOfThirdGradeNotVotedKeys.toString(10)
    },
    {
      name: '총계',
      firstGrade: (adminService.status.keyStatus.numberOfFirstGradeVotedKeys
        + adminService.status.keyStatus.numberOfFirstGradeNotVotedKeys)
        .toString(10),
      secondGrade: (adminService.status.keyStatus.numberOfSecondGradeVotedKeys
        + adminService.status.keyStatus.numberOfSecondGradeNotVotedKeys)
        .toString(10),
      thirdGrade: (adminService.status.keyStatus.numberOfThirdGradeVotedKeys
        + adminService.status.keyStatus.numberOfThirdGradeNotVotedKeys)
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
