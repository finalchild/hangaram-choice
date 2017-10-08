import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate} from './result';
import {MdDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService, private dialog: MdDialog) {}

  results1M = forChart(this.adminService.result.candidates1M);
  results1F = forChart(this.adminService.result.candidates1F);
  results2 = forChart(this.adminService.result.candidates2);

  turnoutColumns = ['name', 'firstGrade', 'secondGrade'];
  turnoutDataSource = new TurnoutDataSource(this.adminService);

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#333399', '#336633', '#FF66FF', '#CC66CC', '#FFCCFF']
  };

  openCreateStudentKeysDialog() {
    this.dialog.open(CreateStudentKeysDialogComponent);
  }

  openChangeAdminPasswordDialog() {
    this.dialog.open(ChangeAdminPasswordDialogComponent);
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
        secondGrade: this.adminService.result.numberOfSecondGradeVotedKeys.toString(10)
      },
      {
        name: '미투표',
        firstGrade: this.adminService.result.numberOfFirstGradeNotVotedKeys.toString(10),
        secondGrade: this.adminService.result.numberOfSecondGradeNotVotedKeys.toString(10)
      },
      {
        name: '총계',
        firstGrade: (this.adminService.result.numberOfFirstGradeVotedKeys + this.adminService.result.numberOfFirstGradeNotVotedKeys)
          .toString(10),
        secondGrade: (this.adminService.result.numberOfSecondGradeVotedKeys + this.adminService.result.numberOfSecondGradeNotVotedKeys)
          .toString(10)
      }
    ];
    console.log(this.data);
  }

  connect(collectionViewer: CollectionViewer): Observable<Element[]> {
    console.log('connecting');
    console.log(Observable.of(this.data));
    return Observable.of(this.data);
  }

  disconnect(collectionViewer: CollectionViewer): void {}

}

interface Element {
  name: string;
  firstGrade: string;
  secondGrade: string;
}
