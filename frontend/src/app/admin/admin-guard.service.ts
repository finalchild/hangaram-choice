import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AdminService} from './admin.service';

@Injectable()
export class AdminGuardService implements CanActivate {

  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(): boolean {
    if (!this.adminService.adminPassword) {
      this.router.navigate(['/admin/login']);
      return false;
    } else {
      return true;
    }
  }

}
