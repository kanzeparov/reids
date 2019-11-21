import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';

import { SharedModule } from '@shared/shared.module';
import { TransferSharedModule } from '@features/transfer/shared/transfer-shared.module';

import { DepositRoutingModule } from './deposit-routing.module';
import { CanActivateDepositStatus } from './deposit-status.guard';

import { DepositFormComponent } from './pages/deposit-form/deposit-form.component';

@NgModule({
  declarations: [
    DepositFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,

    SharedModule,
    DepositRoutingModule,

    TransferSharedModule,
  ],
  providers: [
    CanActivateDepositStatus,
  ],
})
export class DepositModule { }
