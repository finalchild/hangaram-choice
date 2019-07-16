import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminLoginComponent} from './admin-login.component';
import {AdminResultComponent} from './admin-result.component';
import {
  MatButtonModule, MatCardModule,
  MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatSortModule,
  MatTableModule, MatToolbarModule
} from '@angular/material';
import {AdminGuardService} from './admin-guard.service';
import {AdminService} from './admin.service';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';
import {ListOldPollsDialogComponent} from './admin-list-old-polls-dialog.component';
import {OldPollResultDialogComponent} from './admin-old-poll-result-dialog.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {StudentsDialogComponent} from './admin-students-dialog.component';
import {VoteDetailDialogComponent} from './admin-vote-detail-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLoginComponent,
    AdminResultComponent,
    ChangeAdminPasswordDialogComponent,
    CreateStudentKeysDialogComponent,
    InitializeDialogComponent,
    ListOldPollsDialogComponent,
    OldPollResultDialogComponent,
    StudentsDialogComponent,
    VoteDetailDialogComponent
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ChangeAdminPasswordDialogComponent,
    CreateStudentKeysDialogComponent,
    InitializeDialogComponent,
    ListOldPollsDialogComponent,
    OldPollResultDialogComponent,
    StudentsDialogComponent,
    VoteDetailDialogComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: AdminLoginComponent
      },
      {
        path: 'result',
        component: AdminResultComponent,
        canActivate: [AdminGuardService]
      },
      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]),
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatTableModule,
    MatListModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSortModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AdminService,
    AdminGuardService
  ]
})
export class AppModule {
}
