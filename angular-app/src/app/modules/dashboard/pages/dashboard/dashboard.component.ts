import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { MetersApiService } from '@modules/dashboard/services/meters/meters-api.service';
import { MetersStoreService } from '@modules/dashboard/services/meters/meters-store.service';

import { MeterReportsApiService } from '@modules/dashboard/services/meter-reports/meter-reports-api.service';
import { MeterReportsStoreService } from '@modules/dashboard/services/meter-reports/meter-reports-store.service';
import { MeterReportsUpdatesService } from '@modules/dashboard/services/meter-reports/meter-reports-updates.service';

import { ChartReportsApiService } from '@modules/dashboard/services/chart/chart-reports-api.service';

import { MeterReportsDataService } from '@modules/dashboard/services/meter-reports/meter-reports-data.service';

import { AppState } from '@app/app.state';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    MetersApiService,
    MetersStoreService,

    MeterReportsApiService,
    MeterReportsStoreService,

    ChartReportsApiService,
    MeterReportsUpdatesService,

    MeterReportsDataService,
  ]
})
export class DashboardComponent implements OnInit {
  sortedMetersList$ = this.metersStore.getSortedMeters();
  meterReports$ = this.meterReportsStore.getMeterReports();

  meterReportsTableItems$ = this.meterReportsData.buildTableItems(
    this.sortedMetersList$,
    this.meterReports$,
  );

  reportsUpdates$ = this.meterReportsApi.streamUpdates();

  consumptionChartData$ = this.chartReportsApi.fetchInitialConsumption();
  consumptionChartUpdates$ = this.reportsUpdates$.pipe(map(this.reportsUpdates.buildConsumption));

  priceChartData$ = this.chartReportsApi.fetchInitialPrices();
  priceChartUpdates$ = this.reportsUpdates$.pipe(map(this.reportsUpdates.buildPrice));

  onderWebsiteUrl = 'http://onder.tech';

  constructor(
    private store$: Store<AppState>,

    private metersApi: MetersApiService,
    private metersStore: MetersStoreService,

    private meterReportsApi: MeterReportsApiService,
    private meterReportsStore: MeterReportsStoreService,

    private meterReportsData: MeterReportsDataService,

    private chartReportsApi: ChartReportsApiService,
    private reportsUpdates: MeterReportsUpdatesService,
  ) { }

  ngOnInit() {
    this.fetchMeters();
    this.fetchMeterReportsData();

    this.handleMeterUpdates();
  }

  private fetchMeters() {
    this.metersApi
      .fetchMeters()
      .subscribe(this.metersStore.addCollection);

    this.metersApi
      .fetchMeterRelations()
      .subscribe(this.metersStore.addRelations);
  }

  private fetchMeterReportsData() {
    this.meterReportsApi
      .fetchInitialMeters()
      .subscribe(this.meterReportsStore.addCollection);
  }

  private handleMeterUpdates() {
    this.reportsUpdates$
      .pipe(map(this.reportsUpdates.buildMeters))
      .subscribe(this.meterReportsStore.updateCollection);
  }
}
