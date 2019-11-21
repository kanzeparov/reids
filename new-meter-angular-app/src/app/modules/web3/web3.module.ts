import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { web3Reducer } from './store/web3.reducer';

import { Web3ProviderService } from '@modules/web3/services/web3-provider.service';
import { Web3Service } from '@modules/web3/services/web3.service';

import { Web3EthService } from '@modules/web3/services/currency/web3-eth.service';
import { Web3MiptService } from '@modules/web3/services/currency/web3-mipt.service';
import { Web3HelperService } from '@modules/web3/services/currency/web3-helper.service';

import { Web3ActionsService } from './services/web3-actions.service';
import { Web3SelectorsService } from './services/web3-selectors.service';

@NgModule({
  imports: [
    StoreModule.forFeature('web3', web3Reducer),
  ],
  providers: [
    Web3ProviderService,
    Web3Service,

    Web3EthService,
    Web3MiptService,
    Web3HelperService,

    Web3ActionsService,
    Web3SelectorsService,
  ],
})
export class Web3Module { }
