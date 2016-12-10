const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)

const App = require('./App.vue')
const store = require('./store.js')

const app = new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  },
  methods: {
    startWatchingScroll: function () {
      document.addEventListener('scroll', () => {
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
        console.log(scrollTop)
        store.commit('updateScrollTop', scrollTop)
      })
    }
  }
})
app.startWatchingScroll()
