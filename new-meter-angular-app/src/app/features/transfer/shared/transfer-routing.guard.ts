import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Web3SelectorsService } from '@modules/web3/services/web3-selectors.service';

@Injectable()
export class CanActivateTransferForm implements CanActivate {

  constructor(
    private router: Router,
    private web3Selectors: Web3SelectorsService,
  ) {}

  canActivate() {
    const web3Availability$ = this.web3Selectors.whenReady$().pipe(
      switchMap(() => this.web3Selectors.isAvailable$())
    );

    this.web3Selectors.whenUnavailable$().subscribe(() => {
      this.router.navigate(['/access-restricted']);
    });

    return web3Availability$;
  }
}
