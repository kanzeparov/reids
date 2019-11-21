import * as moment from 'moment';

moment.updateLocale('en', {
  relativeTime: {
    future: '%s',
    past: '%s',
    s:  'now',
    ss: '%s secs',
    m:  '1 min',
    mm: '%d mins',
    h:  '1 hr',
    hh: '%d hrs',
    d:  '1 day',
    dd: '%d days',
    M:  '1 mon',
    MM: '%d mons',
    y:  '1 year',
    yy: '%d years',
  },
});

const UNIX_IN_SECONDS_MAX = 1_000_000_000_0;
const UNIX_IN_MILLISECONDS_MAX = 1_000_000_000_000_0;

export const isUnixInSeconds = (timestamp: number): boolean => {
  return UNIX_IN_SECONDS_MAX > timestamp;
};

export const isUnixInMs = (timestamp: number): boolean => {
  return UNIX_IN_SECONDS_MAX < timestamp && UNIX_IN_MILLISECONDS_MAX > timestamp;
};

export const unixInMs = (timestamp: number): number => {
  return isUnixInSeconds(timestamp) ? timestamp * 1000 : timestamp;
};

export const unixInSecs = (timestamp: number): number => {
  return isUnixInMs(timestamp) ? timestamp / 1000 : timestamp;
};

export const unixTimestampDiff = (timestamp: number): number => {
  return unixInSecs(timestamp) - unixInSecs(Date.now());
};

export const fromNow = (timestamp: number): string => {
  return moment(timestamp).fromNow().trim();
};

export const formatDateTime = (timestamp: number, pattern: string = 'HH:mm DD mmm'): string => {
  return moment(timestamp).format(pattern);
};

export const formatTime = (timestamp: number, pattern: string = 'HH:mm'): string => {
  return moment(timestamp).format(pattern);
};
