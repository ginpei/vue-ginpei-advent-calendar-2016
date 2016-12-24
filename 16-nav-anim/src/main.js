const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

var App = require('./App.vue')
var store = require('./store.js')

Vue.filter('textPreview', function (value, length = 128) {
  let result = value.slice(0, length)
  if (value.length > 128) {
    result += '…'
  }
  return result
})

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
