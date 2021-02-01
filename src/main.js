import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import components from '@urapywka/vkui/src/components'

import '@urapywka/vkui-icons'
import '@urapywka/vkui-icons/dist/vkui-icons.css'

import PortalVue from 'portal-vue'
Vue.use(PortalVue)



new Vue({
  components,
  render: h => h(App),
}).$mount('#app')
