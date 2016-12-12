const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    files: []
  },
  mutations: {
    setFiles (state, files) {
      state.files = Array.from(files)
    }
  }
})
