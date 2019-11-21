import { MutationTree } from 'vuex'
import { IMeterErrorState, IMeterError } from './types'

export const mutations: MutationTree<IMeterErrorState> = {
  setErrors ({ data }: IMeterErrorState, errors: Array<IMeterError>) {
    data.errors = errors
  },
}
