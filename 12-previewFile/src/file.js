const Vuex = require('vuex')

// const URL_BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

module.exports = new Vuex.Store({
  state: {
    files: []
  },
  mutations: {
    setFiles (state, files) {
      state.files = []
      Array.prototype.forEach.call(files, file => {
        const data = {
          name: file.name,
          size: file.size,
          type: file.type
        }
        if (file.type.startsWith('image/')) {
          data.previewImageSrc = window.URL.createObjectURL(file)
        }
        state.files.push(data)
      })
    }
  }
})
