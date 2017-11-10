import {Injectable} from '@angular/core';
import {Status} from './status';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AdminService {

  adminPassword: string;
  result: Status;

  constructor(private http: HttpClient) {}

  resetAuth(): void {
    this.adminPassword = undefined;
  }

  refreshResult(): void {
    this.http.post('http://localhost:3000/api/status', {
      adminPassword: this.adminPassword
    })
      .subscribe(data => {
        this.result = <Status>data;
      });
  }

}
