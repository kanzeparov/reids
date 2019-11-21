import WrongBrowser from './WrongBrowser.vue'
export default WrongBrowser

import { Route } from 'vue-router'
import router from '@/consumer/router'
router.addRoutes([{
  path: '/wrong-browser',
  name: 'Wrong Browser',
  component: WrongBrowser,
  meta: {
    disableNavbar: true,
  },
}])

router.beforeEach((to: Route, from: Route, next: Function) => {
  // TODO: Properly check browser type
  const isWrongBrowser = window.navigator.userAgent.search('oh hah') !== -1
  const isWrongBrowserPage = to.name === 'Wrong Browser'

  if (isWrongBrowser && !isWrongBrowserPage) {
    return next({ name: 'Wrong Browser' })
  }

  if (!isWrongBrowser && isWrongBrowserPage) {
    return next({ name: 'Dashboard' })
  }

  next()
})
