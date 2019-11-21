import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Config as CountdownConfig } from 'ngx-countdown';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {
  DAY_IN_SECONDS = 24 * 60 * 60;
  HOUR_IN_SECONDS = 60 * 60;
  MINUTE_IN_SECONDS = 60;

  TEMPLATE_TYPES = {
    WITH_DAYS_AND_HOURS: 'With days and hours',
    WITH_HOURS_AND_MINUTES: 'With hours and minutes',
    WITH_MINUTES_AND_SECONDS: 'With minutes and seconds',
    WITH_ONLY_SECONDS: 'With only seconds',
  };

  @Input('timeLeft') timeLeft: number;
  @Input() channelUuid: string;
  @Output('finished') finishedEvent: EventEmitter<any> = new EventEmitter();

  daysLeft = 0;
  hoursLeft = 0;
  minutesLeft = 0;

  countdownConfig: CountdownConfig;

  currentTemplateType = null;

  constructor() { }

  ngOnInit() {
    this.calculateTimeUnitsLeft(this.timeLeft);
    this.currentTemplateType = this.getTemplateType();
    this.countdownConfig = this.getCountdownConfig(this.timeLeft);
  }

  onFinish() {
    this.finishedEvent.emit(this.channelUuid);
  }

  onNotify(timestampInMilliseconds: number) {
    const timestampInSeconds = timestampInMilliseconds / 1000;
    const prevTemplateType = this.currentTemplateType;

    this.calculateTimeUnitsLeft(timestampInSeconds);
    this.currentTemplateType = this.getTemplateType();

    if (this.currentTemplateType !== prevTemplateType) {
      this.countdownConfig = this.getCountdownConfig(timestampInSeconds);
    }
  }

  /* Common helpers */

  private getTemplateType() {
    const withDaysAndHours = this.daysLeft > 0;
    const withHoursAndMinutes = this.hoursLeft > 0 && this.hoursLeft < 24;
    const withMinutesAndSeconds = this.minutesLeft > 0 && this.minutesLeft < 60;
    const withOnlySeconds = this.minutesLeft === 0;

    switch (true) {
      case withDaysAndHours:      return this.TEMPLATE_TYPES.WITH_DAYS_AND_HOURS;
      case withHoursAndMinutes:   return this.TEMPLATE_TYPES.WITH_HOURS_AND_MINUTES;
      case withMinutesAndSeconds: return this.TEMPLATE_TYPES.WITH_MINUTES_AND_SECONDS;
      case withOnlySeconds:       return this.TEMPLATE_TYPES.WITH_ONLY_SECONDS;

      default: return null;
    }
  }

  private getCountdownConfig(timeLeft: number) {
    return {
      leftTime: timeLeft,
      notify: this.getNotificationTimestamps(),
    };
  }

  /* Time calculations */

  private getNotificationTimestamps() {
    const daysNotifications = new Array(this.daysLeft)
      .fill(null)
      .map((_, index) => (this.DAY_IN_SECONDS * (index + 1)) - 1);

    return [
      this.HOUR_IN_SECONDS - 1,
      this.MINUTE_IN_SECONDS - 1,
      ...daysNotifications,
    ];
  }

  private calculateTimeUnitsLeft(timestampInSeconds: number) {
    this.daysLeft = this.getDaysLeft(timestampInSeconds);
    this.hoursLeft = this.getHoursLeft(timestampInSeconds);
    this.minutesLeft = this.getMinutesLeft(timestampInSeconds);
  }

  private getDaysLeft(timeLeft: number) {
    const daysLeft = Math.ceil(timeLeft / this.DAY_IN_SECONDS) - 1;
    return daysLeft > 0 ? daysLeft : 0;
  }

  private getHoursLeft(timeLeft: number) {
    const daysLeft = Math.ceil(timeLeft / this.HOUR_IN_SECONDS) - 1;
    return daysLeft > 0 ? daysLeft : 0;
  }

  private getMinutesLeft(timeLeft: number) {
    const daysLeft = Math.ceil(timeLeft / this.MINUTE_IN_SECONDS) - 1;
    return daysLeft > 0 ? daysLeft : 0;
  }
}
