const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    hash: ''
  },
  mutations: {
    updateCurrentHash: function (state) {
      state.hash = window.location.hash
    }
  }
})
