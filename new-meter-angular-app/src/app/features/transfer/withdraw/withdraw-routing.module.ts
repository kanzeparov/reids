import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WithdrawFormComponent } from './pages/withdraw-form/withdraw-form.component';
import { TransferSuccessComponent } from '@features/transfer/shared/pages/transfer-success/transfer-success.component';
import { TransferErrorComponent } from '@features/transfer/shared/pages/transfer-error/transfer-error.component';

import { CanActivateWithdrawStatus } from './withdraw-status.guard';
import { CanActivateTransferForm } from '@features/transfer/shared/transfer-routing.guard';

import { LoadDeviceResolver } from '@shared/resolvers/load-device.resolver';

const routes: Routes = [
  {
    path: 'form',
    component: WithdrawFormComponent,
    canActivate: [CanActivateTransferForm],
    resolve: { deviceLoaded: LoadDeviceResolver },
    data: {
      title: 'Withdraw',
    },
  },

  {
    path: 'success',
    component: TransferSuccessComponent,
    canActivate: [CanActivateWithdrawStatus],
    data: {
      title: 'Withdraw',
    },
  },

  {
    path: 'error',
    component: TransferErrorComponent,
    canActivate: [CanActivateWithdrawStatus],
    data: {
      title: 'Withdraw',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WithdrawRoutingModule { }
