import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { VoteFormComponent } from './vote.component';
import { ChoiceService } from './choice.service';
import { LoginComponent } from './login.component';
import {
  ErrorStateMatcher,
  MdButtonModule, MdCardModule, MdFormFieldModule, MdIconModule, MdIconRegistry, MdInputModule,
  MdRadioModule, MdTabsModule, showOnDirtyErrorStateMatcher
} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {StudentGuardService} from './student-guard.service';
import {MdToolbarModule} from '@angular/material';
import {HttpModule} from '@angular/http';
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
    MdButtonModule,
    MdFormFieldModule,
    MdInputModule,
    MdRadioModule,
    MdToolbarModule,
    MdIconModule,
    HttpModule,
    MdTabsModule,
    MdCardModule,
    BrowserAnimationsModule
  ],
  providers: [ChoiceService, StudentGuardService, MdIconRegistry],
  bootstrap: [AppComponent]
})
export class AppModule {}
