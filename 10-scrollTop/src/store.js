const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    scrollTop: 0
  },
  mutations: {
    updateScrollTop: function (state, scrollTop) {
      state.scrollTop = scrollTop
    }
  }
})
