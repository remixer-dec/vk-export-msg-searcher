import Vue from 'vue'
import MainScreen from './components/MainScreen.vue'

Vue.config.productionTip = false
import components from '@urapywka/vkui/src/components'

import icons from '@urapywka/vkui-icons/src/components'
import '@urapywka/vkui-icons/dist/vkui-icons.css'

import PortalVue from 'portal-vue'
Vue.use(PortalVue)

const app = new Vue({
  components: {...components, ...icons},
  render: h => h(MainScreen),
}).$mount('#app')


window.onhashchange = function(e) {
    app.$emit('back')
}
