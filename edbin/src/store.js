const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    dragging: false,
    file: null
  },
  mutations: {
    setDragging: function (state, dragging) {
      state.dragging = dragging
    },
    setFile: function (state, file) {
      state.file = file
    }
  }
})
