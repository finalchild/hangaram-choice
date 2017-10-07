import {Injectable} from '@angular/core';
import {CandidateNames} from './candidate_names';

@Injectable()
export class ChoiceService {

  key: number;
  grade: number;
  candidateNames: CandidateNames = new CandidateNames();

  resetAuth() {
    this.key = undefined;
    this.grade = undefined;
  }

}
