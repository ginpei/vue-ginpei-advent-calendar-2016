const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

const App = require('./App.vue')

new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})
