const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    buffer: null,
    dragging: false,
    file: null
  },
  mutations: {
    setBuffer: function (state, buffer) {
      state.buffer = buffer
    },
    setDragging: function (state, dragging) {
      state.dragging = dragging
    },
    setFile: function (state, file) {
      state.file = file
    }
  }
})
