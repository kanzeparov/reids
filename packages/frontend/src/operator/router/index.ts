import vue from 'vue'
import vueRouter from 'vue-router'
import Home from '../pages/Home'

vue.use(vueRouter)

export default new vueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})
