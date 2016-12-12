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
        if (file.type.startsWith('text/')) {
          // Is it OK to load file async here?
          data.textContent = 'loading...'

          const reader = new window.FileReader()
          reader.onloadend = event => {
            const text = event.target.result
            data.textContent = text
          }
          reader.readAsText(file)
        }
        state.files.push(data)
      })
    }
  }
})
