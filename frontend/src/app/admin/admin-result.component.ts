import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate, downloadResult} from './status';
import {MdDialog, MdIconRegistry} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {DomSanitizer} from '@angular/platform-browser';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService,
              private dialog: MdDialog,
              private http: HttpClient,
              iconRegistry: MdIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('refresh', sanitizer.bypassSecurityTrustResourceUrl('assets/img/refresh.svg'));
  }

  results1M = forChart(this.adminService.result.candidates1M);
  results1F = forChart(this.adminService.result.candidates1F);
  results2 = forChart(this.adminService.result.candidates2);

  turnoutColumns = ['name', 'firstGrade', 'secondGrade', 'thirdGrade'];
  turnoutDataSource = new TurnoutDataSource(this.adminService);

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
    downloadResult(this.adminService.result);
  }

  refresh() {
    this.adminService.refreshResult().then(() => {
      this.results1M = forChart(this.adminService.result.candidates1M);
      this.results1F = forChart(this.adminService.result.candidates1F);
      this.results2 = forChart(this.adminService.result.candidates2);
      this.turnoutDataSource = new TurnoutDataSource(this.adminService);
    });
  }

  openPoll() {
    this.http.post('http://localhost:3000/api/admin/openpoll', {
      adminPassword: this.adminService.adminPassword
    }).subscribe(data => {
      alert(data['message']);
      this.refresh();
    });
  }

  closePoll() {
    this.http.post('http://localhost:3000/api/admin/closepoll', {
      adminPassword: this.adminService.adminPassword
    }).subscribe(data => {
      alert(data['message']);
      this.refresh();
    });
  }

  openInitializeDialog() {
    this.dialog.open(InitializeDialogComponent);
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

class TurnoutDataSource extends DataSource<Element> {

  data: Element[];

  constructor(private adminService: AdminService) {
    super();
    this.data = [
      {
        name: '투표 완료',
        firstGrade: this.adminService.result.numberOfFirstGradeVotedKeys.toString(10),
        secondGrade: this.adminService.result.numberOfSecondGradeVotedKeys.toString(10),
        thirdGrade: this.adminService.result.numberOfThirdGradeVotedKeys.toString(10)
      },
      {
        name: '미투표',
        firstGrade: this.adminService.result.numberOfFirstGradeNotVotedKeys.toString(10),
        secondGrade: this.adminService.result.numberOfSecondGradeNotVotedKeys.toString(10),
        thirdGrade: this.adminService.result.numberOfThirdGradeNotVotedKeys.toString(10)
      },
      {
        name: '총계',
        firstGrade: (this.adminService.result.numberOfFirstGradeVotedKeys + this.adminService.result.numberOfFirstGradeNotVotedKeys)
          .toString(10),
        secondGrade: (this.adminService.result.numberOfSecondGradeVotedKeys + this.adminService.result.numberOfSecondGradeNotVotedKeys)
          .toString(10),
        thirdGrade: (this.adminService.result.numberOfThirdGradeVotedKeys + this.adminService.result.numberOfThirdGradeNotVotedKeys)
          .toString(10)
      }
    ];
  }

  connect(collectionViewer: CollectionViewer): Observable<Element[]> {
    return Observable.of(this.data);
  }

  disconnect(collectionViewer: CollectionViewer): void {}
}

interface Element {
  name: string;
  firstGrade: string;
  secondGrade: string;
  thirdGrade: string;
}
