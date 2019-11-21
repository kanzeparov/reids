import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownModule } from 'ngx-countdown';

import { ShortUuidPipe } from './pipes/short-uuid.pipe';
import { ToFixedPipe } from './pipes/to-fixed.pipe';
import { ToCiPrefixPipe } from './pipes/to-ci-prefix.pipe';
import { FromNowPipe } from './pipes/from-now.pipe';

import { OffsetBlockComponent } from './components/offset-block/offset-block.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { OutlineButtonComponent } from './components/outline-button/outline-button.component';
import { FilledButtonComponent } from './components/filled-button/filled-button.component';

import { MatRippleModule } from '@angular/material';

@NgModule({
  declarations: [
    ShortUuidPipe,
    ToFixedPipe,
    ToCiPrefixPipe,
    FromNowPipe,
    OffsetBlockComponent,
    SpinnerComponent,
    CountdownComponent,
    OutlineButtonComponent,
    FilledButtonComponent,
  ],
  imports: [
    CommonModule,
    CountdownModule,

    MatRippleModule,
  ],
  exports: [
    ShortUuidPipe,
    ToFixedPipe,
    ToCiPrefixPipe,
    FromNowPipe,
    OffsetBlockComponent,
    SpinnerComponent,
    CountdownComponent,
    OutlineButtonComponent,
    FilledButtonComponent,
  ],
})
export class SharedModule { }
