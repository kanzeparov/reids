import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { Memoize } from '@core/decorators/memoize.decorator';

import {
  ChannelsDrawerService
} from '@modules/dashboard/services/channels/channels-drawer.service';

import { MeterReportsTableItem } from '@modules/dashboard/models/meter-reports-table-item.model';

@Component({
  selector: 'dashboard-meter-reports-table',
  templateUrl: './meter-reports-table.component.html',
  styleUrls: ['./meter-reports-table.component.scss'],
})
export class MeterReportsTableComponent implements OnInit {
  @Input('items') items$: Observable<MeterReportsTableItem[]>;

  walletLinkEnabled = false;

  constructor(
    private route: ActivatedRoute,
    private channelDetails: ChannelsDrawerService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(this.setWalletLinkAvailability);
  }

  @Memoize()
  getMeterWalletUrl(uuid: string) {
    return `https://rinkeby.etherscan.io/address/${uuid}`;
  }

  trackMeter(index: number, item: MeterReportsTableItem) {
    return item.uuid;
  }

  setWalletLinkAvailability = (queryParams: any) => {
    if (!queryParams.etherscan) {
      return;
    }

    this.walletLinkEnabled = queryParams.etherscan;
  }
}
