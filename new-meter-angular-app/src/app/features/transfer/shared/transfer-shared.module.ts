import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatRadioModule } from '@angular/material';

import { SharedModule } from '@shared/shared.module';

import { TransferSuccessComponent } from './pages/transfer-success/transfer-success.component';
import { TransferErrorComponent } from './pages/transfer-error/transfer-error.component';

import { AccountBalanceRadioComponent } from './components/account-balance-radio/account-balance-radio.component';
import { TransferInProgressComponent } from './components/transfer-in-progress/transfer-in-progress.component';

import { CanActivateTransferForm } from '@features/transfer/shared/transfer-routing.guard';
import { TransferFlowService } from '@features/transfer/shared/services/transfer-flow.service';
import { EffectsModule } from '@ngrx/effects';
import { TransferEffects } from '@features/transfer/shared/transfer.effects';

@NgModule({
  declarations: [
    TransferSuccessComponent,
    TransferErrorComponent,
    AccountBalanceRadioComponent,
    TransferInProgressComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,

    RouterModule,

    FormsModule,
    MatRadioModule,
    MatProgressSpinnerModule,

    EffectsModule.forFeature([
      TransferEffects,
    ]),
  ],
  exports: [
    TransferSuccessComponent,
    TransferErrorComponent,
    AccountBalanceRadioComponent,
    TransferInProgressComponent,
  ],
  providers: [
    CanActivateTransferForm,
    TransferFlowService,
  ],
})
export class TransferSharedModule { }
