import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { ChannelItem, ChannelsCollection } from '@modules/channels/store/channels.model';
import { DashboardChannelsBillDiff } from '@features/dashboard/models/dashboard-channels.model';
import { GravatarSelectorsService } from '@modules/gravatar/services/gravatar-selectors.service';
import { Memoize } from '@shared/decorators/memoize.decorator';

@Component({
  selector: 'dashboard-meters-table',
  templateUrl: './meters-table.component.html',
  styleUrls: ['./meters-table.component.scss']
})
export class MetersTableComponent implements OnInit, OnDestroy {
  @Input() channels$: Observable<ChannelsCollection>;
  @Input() channelsBillDiff$: Observable<DashboardChannelsBillDiff>;

  channelsBillDiff: DashboardChannelsBillDiff = {};

  constructor(
    private gravatarSelectors: GravatarSelectorsService
  ) { }

  ngOnInit() {
    this.channelsBillDiff$
      .pipe(untilDestroyed(this),)
      .subscribe((channelsBillDiff: DashboardChannelsBillDiff) => {
        this.channelsBillDiff = channelsBillDiff;
      });
  }

  ngOnDestroy() { }

  @Memoize()
  getGravatar$(uuid: string) {
    return this.gravatarSelectors.getGravatarByUuid$(uuid);
  }

  getChannelBillDiff(channelUuid: string) {
    const diff = this.channelsBillDiff[channelUuid];
    if (!diff) {
      return 0;
    }

    return diff;
  }

  trackChannel(index: number, channel: ChannelItem) {
    return channel.uuid;
  }

}
