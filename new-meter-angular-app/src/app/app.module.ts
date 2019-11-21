import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatProgressSpinnerModule } from '@angular/material';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '@env';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from './layout/layout.module';
import { CoreModule } from './core/core.module';

/* Modules */

import { DeviceModule } from '@modules/device/device.module';
import { ChannelsModule } from '@modules/channels/channels.module';
import { GravatarModule } from '@modules/gravatar/gravatar.module';
import { AccountBalanceModule } from '@modules/account-balance/account-balance.module';
import { Web3Module } from '@modules/web3/web3.module';

/* Effects */

import { DeviceEffects } from '@shared/effects/device.effects';
import { Web3Effects } from '@shared/effects/web3.effects';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,

    MatProgressSpinnerModule,

    StoreModule.forRoot({}),
    EffectsModule.forRoot([
      DeviceEffects,
      Web3Effects,
    ]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),

    DeviceModule,
    ChannelsModule,
    GravatarModule,
    AccountBalanceModule,
    Web3Module,

    CoreModule,
    LayoutModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
