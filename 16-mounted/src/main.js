const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

var App = require('./App.vue')
var store = require('./store.js')

new Vue({
  el: '#app',
  render (createElement) {
    return createElement(App)
  }
})

// manage location hash
window.addEventListener('hashchange', (event) => {
  updateCurrentHash()
})
updateCurrentHash()
function updateCurrentHash () {
  store.commit('setCurrentHash', window.location.href)
}
