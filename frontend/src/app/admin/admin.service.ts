import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {defer, Promise} from 'q';
import Status from '../../common/Status';
import StatusRequest from '../../common/request/admin/StatusRequest';
import {backendUrl} from "../app.component";

@Injectable()
export class AdminService {

  adminPassword: string;
  status: Status;

  constructor(private http: HttpClient) {
  }

  resetAuth(): void {
    this.adminPassword = undefined;
  }

  refreshResult(): Promise<void> {
    const deferred = defer<void>();
    this.http.post(backendUrl + '/api/admin/status', {
      adminPassword: this.adminPassword
    } as StatusRequest)
      .subscribe(data => {
        this.status = <Status>data;
        deferred.resolve();
      });

    return deferred.promise;
  }

}
