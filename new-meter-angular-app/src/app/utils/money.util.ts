import { toSafeNumber } from '@utils/number.util';
import { TOKEN_EXPONENT } from '@shared/shared.constant';

export const normalizeToken = (rawToken: string) => {
  return toSafeNumber(rawToken) * TOKEN_EXPONENT;
};
