import { GetterTree } from 'vuex'

import { RootState } from '@/consumer/store/types'
import { IMeterErrorState, IMeterError } from './types'

export const getters: GetterTree<IMeterErrorState, RootState> = {
  fixedErrors ({ data }: IMeterErrorState): Array<IMeterError> {
    return data.errors.filter((error: IMeterError) => error.isFixed)
  },
  notFixedErrors ({ data }: IMeterErrorState): Array<IMeterError> {
    return data.errors.filter((error: IMeterError) => !error.isFixed)
  },
}
