import vue from 'vue'
import VueRouter, { Route } from 'vue-router'
import Home from '../pages/Home'
import Settings from '../pages/Settings'
import Deposit from '../pages/Deposit'
import Withdraw from '../pages/Withdraw'
import ErrorLog from '../pages/ErrorLog'

import { store } from '@/consumer/store'

vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Home,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/settings/error',
      name: 'Error log',
      component: ErrorLog
    },
    {
      path: '/deposit',
      name: 'Deposit',
      component: Deposit
    },
    {
      path: '/withdraw',
      name: 'Withdraw',
      component: Withdraw
    },
  ]
})

router.onReady(() => store.dispatch('navigation/setHomeRouteName', 'Dashboard'))

router.beforeEach(async (to: Route, from: Route, next: Function) => {
  await store.dispatch('navigation/setCurrentRoute', to)

  if (from.name) {
    await store.dispatch('navigation/setPrevRoute', from)
  }

  next()
})

export default router
