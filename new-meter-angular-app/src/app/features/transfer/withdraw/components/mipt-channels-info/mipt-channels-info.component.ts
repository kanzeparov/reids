import { Component, Input, OnInit } from '@angular/core';
import { TotalAccountBalance } from '@modules/account-balance/store/account-balance.model';

@Component({
  selector: 'withdraw-mipt-channels-info',
  templateUrl: './mipt-channels-info.component.html',
  styleUrls: ['./mipt-channels-info.component.scss']
})
export class MiptChannelsInfoComponent implements OnInit {

  @Input() balance: TotalAccountBalance;

  isChannelsListShown = false;

  constructor() { }

  ngOnInit() {
  }

  toggleChannelsList() {
    this.isChannelsListShown = !this.isChannelsListShown;
  }

}
