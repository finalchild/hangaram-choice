import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ChoiceService} from './choice.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

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
              iconRegistry: MdIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('done', sanitizer.bypassSecurityTrustResourceUrl('assets/img/done.svg'));
  }

  onVote() {
    this.http.post(`http://localhost:3000/api/vote`, {
      key: this.choiceService.key,
      candidateName1M: this.candidateNameToVote1M,
      candidateName1F: this.candidateNameToVote1F,
      candidateName2: this.candidateNameToVote2
    }).subscribe(data => {
        this.choiceService.resetAuth();
        alert(data['message']);
        this.router.navigate(['/login']);
      }, err => {
        console.log(err);
        if (err instanceof HttpErrorResponse) {
          alert(JSON.parse(err.error)['message']);
        }
      });
  }
}
