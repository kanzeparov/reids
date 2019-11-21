import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';

import { SharedModule } from '@shared/shared.module';
import { TransferSharedModule } from '@features/transfer/shared/transfer-shared.module';

import { WithdrawRoutingModule } from './withdraw-routing.module';
import { CanActivateWithdrawStatus } from './withdraw-status.guard';

import { ChannelsMetaDataService } from './services/channels-meta-data.service';
import { ChannelsStatusService } from './services/channels-status.service';

import { WithdrawFormComponent } from './pages/withdraw-form/withdraw-form.component';
import { MiptChannelsInfoComponent } from './components/mipt-channels-info/mipt-channels-info.component';
import { MiptChannelsListComponent } from './components/mipt-channels-list/mipt-channels-list.component';

@NgModule({
  declarations: [
    WithdrawFormComponent,
    MiptChannelsInfoComponent,
    MiptChannelsListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,

    SharedModule,
    TransferSharedModule,
    WithdrawRoutingModule,
  ],
  providers: [
    CanActivateWithdrawStatus,
    ChannelsMetaDataService,
    ChannelsStatusService,
  ],
})
export class WithdrawModule { }
