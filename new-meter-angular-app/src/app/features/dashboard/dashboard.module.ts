import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { BalanceComponent } from './components/balance/balance.component';
import { MetersTableComponent } from './components/meters-table/meters-table.component';
import { BillDiffComponent } from './components/bill-diff/bill-diff.component';

@NgModule({
  declarations: [
    DashboardComponent,

    BalanceComponent,
    MetersTableComponent,
    BillDiffComponent,
  ],
  imports: [
    CommonModule,

    SharedModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule { }
