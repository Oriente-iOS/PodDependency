import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/base.scss'
import axios from 'axios'
import VueSocketIO from 'vue-socket.io'
import vuescroll from 'vuescroll'
import 'vuescroll/dist/vuescroll.css'

axios.defaults.baseURL = '/'
Vue.use(vuescroll, {
  ops: {
    mode: 'native',
    scrollPanel: {
      scrollingX: false
    },
    bar: {
      keepShow: true,
      background: '#c1c1c1'
    }
  }
})
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: '/'
  })
)

Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)
new Vue({
  render: h => h(App)
}).$mount('#app')
