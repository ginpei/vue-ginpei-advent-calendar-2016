<style>
  .dropzone {
    border: 2px solid #090;
  }
  .dropzone.dragging {
    background-color: #efe;
  }
</style>

<template>
  <div v-on:dragover.prevent="dropzone_dragover" v-on:dragleave.prevent="dropzone_dragleave" v-on:drop.prevent="dropzone_drop" :class="{ dragging: dragging }" class="container dropzone">
    <h1 v-if="!file">Drop Here!</h1>
    <ul v-if="file">
      <li>Name: {{file.name}}</li>
      <li>Size: {{file.size}}</li>
      <li>Type: {{file.type}}</li>
    </ul>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    },
    methods: {
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
      }
    }
  }
</script>
