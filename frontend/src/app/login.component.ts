import {Component} from '@angular/core';
import {ChoiceService} from './choice.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {ErrorStateMatcher, MatIconRegistry, ShowOnDirtyErrorStateMatcher} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {NgModel} from '@angular/forms';
import {mod10} from 'checkdigit';

@Component({
  selector: 'hc-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  constructor(public choiceService: ChoiceService,
              private router: Router,
              private http: HttpClient,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('account_circle', sanitizer.bypassSecurityTrustResourceUrl('assets/img/account_circle.svg'));
  }

  error: string = undefined;
  showOnDirtyErrorStateMatcher: ErrorStateMatcher = new ShowOnDirtyErrorStateMatcher();

  onInput(keyElement: HTMLInputElement, model: NgModel): void {
    if (!keyElement.value || keyElement.value.length !== 8) {
      return;
    }
    const keyWithCheckDigit = parseInt(keyElement.value, 10);
    if (!isValidKeyWithCheckDigit(keyWithCheckDigit)) {
      model.control.setErrors({
        invalid: true
      });
      this.error = '키가 잘못되었습니다';
      keyElement.focus();
      return;
    }
    const key = Math.floor(keyWithCheckDigit / 10);

    this.login(key, keyElement, model);
  }

  onLogin(keyElement: HTMLInputElement, model: NgModel): void {
    if (!keyElement.value || keyElement.value === '') {
      model.control.setErrors({
        empty: true
      });
      this.error = '키를 입력해 주세요';
      keyElement.focus();
      return;
    }
    const keyWithCheckDigit = parseInt(keyElement.value, 10);
    if (!isValidKeyWithCheckDigit(keyWithCheckDigit)) {
      model.control.setErrors({
        invalid: true
      });
      this.error = '키가 잘못되었습니다';
      keyElement.focus();
      return;
    }
    const key = Math.floor(keyWithCheckDigit / 10);

    this.login(key, keyElement, model);
  }

  login(key: number, keyElement: HTMLInputElement, model: NgModel) {
    this.http.post(`http://localhost:3000/api/login`, {
      key: key,
      candidateCacheId: this.choiceService.candidateNames.candidatesCacheId
    })
      .subscribe(data => {
        this.choiceService.key = key;
        this.choiceService.grade = data['grade'];
        if (data['candidateNames']) {
          this.choiceService.candidateNames = data['candidateNames'];
        }
        this.router.navigate(['/vote']);
      }, err => {
        if (err instanceof HttpErrorResponse) {
          model.control.setErrors({
            couldNotLogin: true
          });
          this.error = JSON.parse(err.error)['message'];
          keyElement.focus();
        } else {
          console.log(err);
        }
      });
  }

}

function isValidKeyWithCheckDigit(key: number): boolean {
  return Number.isSafeInteger(key) && key > 0 && key < 100000000 && mod10.isValid(key.toString(10));
}
