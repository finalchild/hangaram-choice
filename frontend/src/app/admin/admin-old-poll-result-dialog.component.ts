import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {mod10} from 'checkdigit';
import Status from '../../common/Status';
import {forChart} from './admin-result.component';
import {downloadResult} from './status';

@Component({
  selector: 'hc-old-poll-result-dialog',
  templateUrl: './admin-old-poll-result-dialog.component.html',
})
export class OldPollResultDialogComponent {

  constructor(private dialogRef: MatDialogRef<OldPollResultDialogComponent>,
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
    downloadResult(this.data);
  }

}
