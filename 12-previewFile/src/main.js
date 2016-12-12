const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

const App = require('./App.vue')

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
