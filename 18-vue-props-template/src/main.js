const Vue = require('vue')

var App = require('./App.vue')

new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})
