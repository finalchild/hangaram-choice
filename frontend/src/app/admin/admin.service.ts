import {Injectable} from '@angular/core';
import {Status} from './status';
import {HttpClient} from '@angular/common/http';
import {Promise, defer} from 'q';

@Injectable()
export class AdminService {

  adminPassword: string;
  result: Status;

  constructor(private http: HttpClient) {}

  resetAuth(): void {
    this.adminPassword = undefined;
  }

  refreshResult(): Promise<void> {
    const deferred = defer<void>();
    this.http.post('http://localhost:3000/api/admin/status', {
      adminPassword: this.adminPassword
    })
      .subscribe(data => {
        this.result = <Status>data;
        deferred.resolve();
      });

    return deferred.promise;
  }

}
