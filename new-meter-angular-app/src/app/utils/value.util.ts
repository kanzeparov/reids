export const hasNoValue = (value: any): boolean => {
  return value === null || value === undefined;
};

export const hasValue = (value: any): boolean => {
  return !hasNoValue(value);
};
