import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {mod10} from 'checkdigit';
import Status from '../common/Status';

@Component({
  selector: 'hc-vote-detail-dialog',
  templateUrl: './admin-vote-detail-dialog.component.html',
})
export class VoteDetailDialogComponent {

  constructor(private dialogRef: MatDialogRef<VoteDetailDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DetailArgument) {
    const keyStatus = data.status.keyStatus;
    if (data.type === '1M' || data.type === '1F') {
      this.totalStudents = keyStatus.numberOfFirstGradeNotVotedKeys + keyStatus.numberOfFirstGradeVotedKeys;
      this.nonVoters = keyStatus.numberOfFirstGradeNotVotedKeys;
      this.voters = keyStatus.numberOfFirstGradeVotedKeys;
    } else if (data.type === '2') {
      this.totalStudents = keyStatus.numberOfFirstGradeNotVotedKeys + keyStatus.numberOfFirstGradeVotedKeys
        + keyStatus.numberOfSecondGradeNotVotedKeys + keyStatus.numberOfSecondGradeVotedKeys
        + keyStatus.numberOfThirdGradeNotVotedKeys + keyStatus.numberOfThirdGradeVotedKeys;
      this.nonVoters = keyStatus.numberOfFirstGradeNotVotedKeys + keyStatus.numberOfSecondGradeNotVotedKeys + keyStatus.numberOfThirdGradeNotVotedKeys;
      this.voters = keyStatus.numberOfFirstGradeVotedKeys + keyStatus.numberOfSecondGradeVotedKeys + keyStatus.numberOfThirdGradeVotedKeys;
    }

    this.turnoutRate = this.voters / this.totalStudents;
    this.turnoutRateString = (this.turnoutRate * 100).toFixed(2) + '%';

    if (data.type === '1M') {
      this.candidateDatas = data.status.candidates.candidates1M.map(candidate => {
        return {
          name: candidate.name,
          photo: data.photoBaseUrl + candidate.name + '.jpg',
          lineStyle: `width: ${(600 * candidate.votes / this.voters).toFixed(2)}px; height: 20px; border-bottom: 7px solid green; position: absolute;`,
          votesString: `${candidate.votes.toString(10)} / ${this.voters.toString(10)} 표 (${(candidate.votes * 100/ this.voters).toFixed(2)}%)`
        };
      });
    } else if (data.type === '1F') {
      this.candidateDatas = data.status.candidates.candidates1F.map(candidate => {
        return {
          name: candidate.name,
          photo: data.photoBaseUrl + candidate.name + '.jpg',
          lineStyle: `width: ${(600 * candidate.votes / this.voters).toFixed(2)}px; height: 20px; border-bottom: 7px solid green; position: absolute;`,
          votesString: `${candidate.votes.toString(10)} / ${this.voters.toString(10)} 표 (${(candidate.votes * 100 / this.voters).toFixed(2)}%)`
        };
      });
    } else if (data.type === '2') {
      this.candidateDatas = data.status.candidates.candidates2.map(candidate => {
        return {
          name: candidate.name,
          photo: data.photoBaseUrl + candidate.name.split(',')[0].trim() + '.jpg',
          lineStyle: `width: ${(600 * candidate.votes / this.voters).toFixed(2)}px; height: 20px; border-bottom: 7px solid green; position: absolute;`,
          votesString: `${candidate.votes.toString(10)} / ${this.voters.toString(10)} 표 (${(candidate.votes * 100 / this.voters).toFixed(2)}%)`
        };
      });
    }
  }

  totalStudents: number;
  nonVoters: number;
  voters: number;
  turnoutRate: number;
  turnoutRateString: string;
  candidateDatas: Array<CandidateData>;

  onNoClick(): void {
    this.dialogRef.close();
  }

}

export interface DetailArgument {
  title: string;
  type: string;
  status: Status;
  photoBaseUrl: string;
}

export interface CandidateData {
  name: string;
  photo: string;
  lineStyle: string;
  votesString: string;
}
