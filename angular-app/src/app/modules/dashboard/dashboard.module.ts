import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '@core/core.module';
import { ChartModule } from '@modules/chart/chart.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { MeterReportsTableComponent } from './components/meter-reports-table/meter-reports-table.component';
import { ConsumptionChartComponent } from './components/consumption-chart/consumption-chart.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';
import { ChannelsComponent } from './components/channels/channels.component';

import { ChannelsMetaDataService } from './services/channels/channels-meta-data.service';
import { ChannelsStatusService } from '@modules/dashboard/services/channels/channels-status.service';

@NgModule({
  declarations: [
    DashboardComponent,

    ConsumptionChartComponent,
    PriceChartComponent,
    MeterReportsTableComponent,
    ChannelsComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,

    CoreModule,
    ChartModule,
    DashboardRoutingModule,
  ],
  providers: [
    ChannelsMetaDataService,
    ChannelsStatusService,
  ],
})
export class DashboardModule { }
