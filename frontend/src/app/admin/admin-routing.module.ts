import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminLoginComponent} from './admin-login.component';
import {AdminResultComponent} from './admin-result.component';
import {
  MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule,
  MatTableModule, MatToolbarModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {AdminGuardService} from './admin-guard.service';
import {AdminService} from './admin.service';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChangeAdminPasswordDialogComponent} from './admin-change-admin-password-dialog.component';
import {CreateStudentKeysDialogComponent} from './admin-create-student-keys-dialog.component';
import {InitializeDialogComponent} from './admin-initialize-dialog.component';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminResultComponent,
    ChangeAdminPasswordDialogComponent,
    CreateStudentKeysDialogComponent,
    InitializeDialogComponent
  ],
  entryComponents: [
    ChangeAdminPasswordDialogComponent, CreateStudentKeysDialogComponent, InitializeDialogComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forChild([
      {
        path: 'admin',
        children: [
          {path: '', redirectTo: 'login', pathMatch: 'full'},
          {path: 'login', component: AdminLoginComponent},
          {path: 'result', component: AdminResultComponent, canActivate: [AdminGuardService]}
        ]
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
    NgxChartsModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AdminService,
    AdminGuardService
  ]
})
export class AdminRoutingModule {
}
