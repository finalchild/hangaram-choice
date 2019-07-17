import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {mod10} from 'checkdigit';
import Status from '../common/Status';
import {downloadResultImpl} from './status';
import {forChart} from './forChart';
import {DetailArgument, VoteDetailDialogComponent} from './admin-vote-detail-dialog.component';

@Component({
  selector: 'hc-old-poll-result-dialog',
  templateUrl: './admin-old-poll-result-dialog.component.html',
})
export class OldPollResultDialogComponent {

  constructor(private dialogRef: MatDialogRef<OldPollResultDialogComponent>,
              private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: Status) {

  }
  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#333399', '#336633', '#FF66FF', '#CC66CC', '#FFCCFF']
  };

  results1M = forChart(this.data.candidates.candidates1M);
  results1F = forChart(this.data.candidates.candidates1F);
  results2 = forChart(this.data.candidates.candidates2);

  onNoClick(): void {
    this.dialogRef.close();
  }

  downloadResult(): void {
    downloadResultImpl(this.data);
  }

  details2() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '2학년 회장단 투표',
        type: '2',
        photoBaseUrl: '/students/' + encodeURIComponent(this.data.pollName) + '/',
        status: this.data
      } as DetailArgument
    });
  }

  details1M() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '1학년 남자 부회장 투표',
        type: '1M',
        photoBaseUrl: '/students/' + encodeURIComponent(this.data.pollName) + '/',
        status: this.data
      } as DetailArgument
    });
  }

  details1F() {
    this.dialog.open(VoteDetailDialogComponent, {
      data: {
        title: '1학년 여자 부회장 투표',
        type: '1F',
        photoBaseUrl: '/students/' + encodeURIComponent(this.data.pollName) + '/',
        status: this.data
      } as DetailArgument
    });
  }

}
