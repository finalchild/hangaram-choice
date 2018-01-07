import {NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {VoteFormComponent} from './vote.component';
import {ChoiceService} from './choice.service';
import {LoginComponent} from './login.component';
import {
  MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatIconRegistry, MatInputModule, MatRadioModule,
  MatTabsModule, MatToolbarModule
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StudentGuardService} from './student-guard.service';
import {HttpClientModule} from '@angular/common/http';
import {AdminRoutingModule} from './admin/admin-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VoteFormComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'vote',
        canActivate: [StudentGuardService],
        component: VoteFormComponent
      }
    ]),
    AdminRoutingModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    BrowserAnimationsModule
  ],
  providers: [ChoiceService, StudentGuardService, MatIconRegistry],
  bootstrap: [AppComponent]
})
export class AppModule {
}
