export interface CiPrefix {
  prefix: string;
  powerRanges: number[];
}

const ciPrefixes: CiPrefix[] = [
  { prefix: 'k', powerRanges: [3, 6] },
  { prefix: 'M', powerRanges: [6, 9] },
  { prefix: 'G', powerRanges: [9, 12] },
  { prefix: 'T', powerRanges: [12, 15] },
  { prefix: 'P', powerRanges: [15, 18] },
  { prefix: 'E', powerRanges: [18, 21] },
  { prefix: 'Z', powerRanges: [21, 24] },
  { prefix: 'Y', powerRanges: [24, 27] },
];

export const toCiPrefix = (rawNumberToPrefix: number, toFixedDigits: number = 1) => {
  const numberToPrefix = Math.abs(rawNumberToPrefix);
  const numberSign = rawNumberToPrefix >= 0 ? '' : '-';

  const ciPrefix = ciPrefixes.find((p: CiPrefix) => {
    return (
      numberToPrefix >= Math.pow(10, p.powerRanges[0]) &&
      numberToPrefix < Math.pow(10, p.powerRanges[1])
    );
  });

  if (!ciPrefix) {
    return `${numberSign}${numberToPrefix.toFixed(0)}`;
  }

  const shortenedNumber = (
    numberToPrefix * Math.pow(10, -ciPrefix.powerRanges[0])
  ).toFixed(toFixedDigits);

  return `${numberSign}${shortenedNumber}${ciPrefix.prefix}`;
};

export const toSafeNumber = (maybeNumber: any, placeholder = 0) => {
  return Number(maybeNumber) || placeholder;
};
