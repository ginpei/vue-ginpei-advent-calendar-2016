<style>
  .dropzone {
    border: 2px solid #090;
  }
  .dropzone.dragging {
    background-color: #efe;
  }
  .binTable-table {
    font-family: monospace;
    width: auto;
  }
  .binTable-table > thead > tr > th,
  .binTable-table > tbody > tr > td {
    padding: 0 0.2em;
    text-align: center;
    width: 1em;
  }
  .binTable-location {
    background-color: #ccc;
    text-align: right;
  }
</style>

<template>
  <div class="container">
    <div v-on:dragover.prevent="dropzone_dragover" v-on:dragleave.prevent="dropzone_dragleave" v-on:drop.prevent="dropzone_drop" :class="{ dragging: dragging }" class="dropzone">
      <h1 v-if="!file">Drop Here!</h1>
      <ul v-if="file">
        <li>Name: {{file.name}}</li>
        <li>Size: {{file.size}}</li>
        <li>Type: {{file.type}}</li>
      </ul>
    </div>
    <table v-if="lines.length > 0" class="table binTable-table">
      <thead>
        <tr class="binTable-location">
          <th></th>
          <th v-for="n in 16">{{n}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(line, index) in lines">
          <td class="binTable-location">{{index.toString(16).toUpperCase()}}</td>
          <td v-for="byte in line">{{byte}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    },
    computed: {
      lines: function () {
        const lines = []

        const buffer = this.buffer
        if (buffer) {
          for (let i = 0; i < 16; i++) {
            lines.push(this.createLine(buffer, i * 16))
          }
        }
        return lines
      }
    },
    methods: {
      createLine: function (buffer, offset) {
        const sArr = []
        const arr = new window.Uint8Array(buffer, offset, 16)
        arr.forEach(byte => {
          const sByte = byte.toString(16).toUpperCase()
          sArr.push(byte < 16 ? '0' + sByte : sByte)
        })
        return sArr
      },
      dropzone_dragover: function (event) {
        store.commit('setDragging', true)
      },
      dropzone_dragleave: function (event) {
        store.commit('setDragging', false)
      },
      dropzone_drop: function (event) {
        store.commit('setDragging', false)

        const files = event.dataTransfer.files
        const file = files[0]
        store.commit('setFile', file)

        const reader = new window.FileReader()
        reader.onload = (event) => {
          this.fileBuffer_loaded(event)
        }
        reader.readAsArrayBuffer(file)
      },
      fileBuffer_loaded: function (event) {
        const buffer = event.target.result
        store.commit('setBuffer', buffer)
      }
    }
  }
</script>
