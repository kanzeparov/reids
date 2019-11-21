export const toSafeNumber = (maybeNumber: any, placeholder = 0) => {
  return Number(maybeNumber) || placeholder;
};
