import {Injectable} from '@angular/core';
import {Candidate, Result} from './result';

@Injectable()
export class AdminService {

  adminPassword: string;
  result: Result;

  resetAuth() {
    this.adminPassword = undefined;
  }

}
