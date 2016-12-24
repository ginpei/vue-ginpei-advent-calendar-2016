const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

var App = require('./App.vue')
var store = require('./store.js')

new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})

window.addEventListener('hashchange', (event) => {
  store.commit('updateCurrentHash')
})
store.commit('updateCurrentHash')
