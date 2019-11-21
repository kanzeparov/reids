import vue from 'vue'
import vueRouter from 'vue-router'
import Home from '../pages/Home'
import Settings from '../pages/Settings'
import OnderList from '../pages/OnderList'

vue.use(vueRouter)

export default new vueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/onders',
      name: 'OnderList',
      component: OnderList
    }
  ]
})
