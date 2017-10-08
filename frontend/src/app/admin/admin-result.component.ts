import {Component} from '@angular/core';
import {AdminService} from './admin.service';
import {Candidate} from './result';
import {MdDialog} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';

@Component({
  selector: 'hc-admin-result',
  templateUrl: './admin-result.component.html'
})
export class AdminResultComponent {

  constructor(private adminService: AdminService, private dialog: MdDialog, private http: HttpClient) {}

  results1M = forChart(this.adminService.result.candidates1M);
  results1F = forChart(this.adminService.result.candidates1F);
  results2 = forChart(this.adminService.result.candidates2);

  scheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  openCreateStudentKeysDialog() {
    this.dialog.open(CreateStudentKeysDialogComponent);
  }

  openChangeAdminPasswordDialog() {
    this.dialog.open(ChangeAdminPasswordDialogComponent, {
      width: '250px'
    });
  }

}

function forChart(candidates: Array<Candidate>): Array<{name: string, value: number}> {
  return candidates.map(function(candidate: Candidate): {name: string, value: number} {
    return {
      name: candidate.name,
      value: candidate.votes
    };
  });
}
