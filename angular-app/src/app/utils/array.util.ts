export const isOversized = (items: any[], sizeLimit: number, shift: number = 0) => {
  return (items.length + shift) > sizeLimit;
};

export const sliceData = (items: any[], sizeLimit: number, shift: number = 0) => {
  const sliceStart = (items.length - sizeLimit) + shift;
  const sliceEnd = items.length + shift;

  return items.slice(sliceStart, sliceEnd);
};
