const Vuex = require('vuex')

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
