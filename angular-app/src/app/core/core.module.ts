import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountdownModule } from 'ngx-countdown';

import { ShortUuidPipe } from './pipes/short-uuid.pipe';
import { ToFixedPipe } from './pipes/to-fixed.pipe';
import { FromNowPipe } from './pipes/from-now.pipe';

import { OffsetBlockComponent } from './components/offset-block/offset-block.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CountdownComponent } from './components/countdown/countdown.component';

@NgModule({
  declarations: [
    ShortUuidPipe,
    ToFixedPipe,
    FromNowPipe,
    OffsetBlockComponent,
    SpinnerComponent,
    CountdownComponent,
  ],
  imports: [
    CommonModule,
    CountdownModule,
  ],
  exports: [
    ShortUuidPipe,
    ToFixedPipe,
    FromNowPipe,
    OffsetBlockComponent,
    SpinnerComponent,
    CountdownComponent,
  ]
})
export class CoreModule { }
