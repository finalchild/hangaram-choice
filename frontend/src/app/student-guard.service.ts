import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {ChoiceService} from './choice.service';

@Injectable()
export class StudentGuardService implements CanActivate {

  constructor(private choiceService: ChoiceService, private router: Router) {}

  canActivate() {
    if (!this.choiceService.key || !this.choiceService.grade) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }

}
