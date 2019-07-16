import {Injectable} from '@angular/core';
import CandidateNamesCache from '../common/CandidateNamesCache';

@Injectable()
export class ChoiceService {

  key: number;
  grade: number;
  cache: CandidateNamesCache = {
    candidatesCacheId: 0,
    candidateNames: null
  };

  resetAuth() {
    this.key = undefined;
    this.grade = undefined;
  }

}
