import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate} from './result';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService) {}

  results1M = forChart(this.adminService.result.candidates1M);
  results1F = forChart(this.adminService.result.candidates1F);
  results2 = forChart(this.adminService.result.candidates2);

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

}

function forChart(candidates: Array<Candidate>): Array<{name: string, value: number}> {
  return candidates.map(function(candidate: Candidate): {name: string, value: number} {
    return {
      name: candidate.name,
      value: candidate.votes
    };
  });
}
