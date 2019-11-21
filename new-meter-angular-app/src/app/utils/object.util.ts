export const objectsAreEqual = (a: object, b: object): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};
