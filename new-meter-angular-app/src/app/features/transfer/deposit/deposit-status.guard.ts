import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class CanActivateDepositStatus implements CanActivate {

  constructor(private router: Router) {}

  canActivate() {
    const canNavigate = this.router.url === '/deposit/form';

    if (canNavigate) {
      return true;
    }

    this.router.navigate(['/access-restricted']);
    return false;
  }
}
