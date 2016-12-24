const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    hash: ''
  },
  mutations: {
    setCurrentHash (state) {
      state.hash = window.location.hash
    }
  }
})
