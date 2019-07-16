import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {AdminService} from './admin.service';
import {HttpClient} from '@angular/common/http';
import {mod10} from 'checkdigit';
import ListOldPollsRequest from '../common/request/admin/ListOldPollsRequest';
import GetOldPollRequest from '../common/request/admin/GetOldPollRequest';
import {OldPollResultDialogComponent} from './admin-old-poll-result-dialog.component';
import {backendUrl} from "./app.component";

@Component({
  selector: 'hc-list-old-polls-dialog',
  templateUrl: './admin-list-old-polls-dialog.component.html',
})
export class ListOldPollsDialogComponent {

  constructor(private dialogRef: MatDialogRef<ListOldPollsDialogComponent>,
              private dialog: MatDialog,
              private adminService: AdminService,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.http.post<Array<String>>(backendUrl + '/api/admin/listoldpolls', {
      adminPassword: this.adminService.adminPassword
    } as ListOldPollsRequest).subscribe(data => {
      this.oldPollNames = data;
    });
  }

  oldPollNames: Array<String>;

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOldPollNameClick(oldPollName: String) {
    this.http.post(backendUrl + '/api/admin/getoldpoll', {
      adminPassword: this.adminService.adminPassword,
      oldPollName: oldPollName
    } as GetOldPollRequest).subscribe(data => {
      this.dialog.open(OldPollResultDialogComponent, {
        data: data
      });
    });
  }
}
