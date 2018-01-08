import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ChoiceService} from './choice.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatIconRegistry, MatTabGroup} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import VoteRequest from '../common/request/VoteRequest';

@Component({
  selector: 'hc-vote',
  templateUrl: './vote.component.html'
})
export class VoteFormComponent {

  candidateNameToVote1M: string;
  candidateNameToVote1F: string;
  candidateNameToVote2: string;

  constructor(public choiceService: ChoiceService,
              public router: Router,
              private http: HttpClient,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('done', sanitizer.bypassSecurityTrustResourceUrl('assets/img/done.svg'));
  }

  onVote(tabElement: MatTabGroup): void {
    if (!this.candidateNameToVote2) {
      tabElement.selectedIndex = 0;
      return;
    }
    if (this.choiceService.grade === 1) {
      if (!this.candidateNameToVote1M) {
        tabElement.selectedIndex = 1;
        return;
      }
      if (!this.candidateNameToVote1F) {
        tabElement.selectedIndex = 2;
        return;
      }
    }

    this.http.post(`http://localhost:3000/api/vote`, {
      key: this.choiceService.key,
      candidateName1M: this.candidateNameToVote1M,
      candidateName1F: this.candidateNameToVote1F,
      candidateName2: this.candidateNameToVote2
    } as VoteRequest).subscribe(data => {
      this.choiceService.resetAuth();
      alert(data['meessage']);
      this.router.navigate(['/login']);
    }, err => {
      console.log(err);
      if (err instanceof HttpErrorResponse) {
        alert(err.error);
      }
    });
  }

  canVote(): boolean {
    if (!this.candidateNameToVote2) {
      return false;
    }
    if (this.choiceService.grade === 1) {
      if (!this.candidateNameToVote1M) {
        return false;
      }
      if (!this.candidateNameToVote1F) {
        return false;
      }
    }
    return true;
  }
}
