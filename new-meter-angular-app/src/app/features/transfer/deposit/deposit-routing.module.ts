import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepositFormComponent } from './pages/deposit-form/deposit-form.component';
import { TransferSuccessComponent } from '@features/transfer/shared/pages/transfer-success/transfer-success.component';
import { TransferErrorComponent } from '@features/transfer/shared/pages/transfer-error/transfer-error.component';

import { CanActivateTransferForm } from '@features/transfer/shared/transfer-routing.guard';
import { CanActivateDepositStatus } from './deposit-status.guard';

import { LoadDeviceResolver } from '@shared/resolvers/load-device.resolver';

const routes: Routes = [
  {
    path: 'form',
    component: DepositFormComponent,
    canActivate: [CanActivateTransferForm],
    resolve: { deviceLoaded: LoadDeviceResolver },
    data: {
      title: 'Deposit',
    },
  },

  {
    path: 'success',
    component: TransferSuccessComponent,
    canActivate: [CanActivateDepositStatus],
    data: {
      title: 'Deposit',
    },
  },

  {
    path: 'error',
    component: TransferErrorComponent,
    canActivate: [CanActivateDepositStatus],
    data: {
      title: 'Deposit',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepositRoutingModule { }
