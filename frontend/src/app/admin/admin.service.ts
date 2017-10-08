import {Injectable} from '@angular/core';
import {Result} from './result';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AdminService {

  adminPassword: string;
  result: Result;

  constructor(private http: HttpClient) {}

  resetAuth(): void {
    this.adminPassword = undefined;
  }

  refreshResult(): void {
    this.http.post(`http://localhost:3000/api/result`, {
      adminPassword: this.adminPassword
    })
      .subscribe(data => {
        this.result = <Result>data;
      });
  }

}
