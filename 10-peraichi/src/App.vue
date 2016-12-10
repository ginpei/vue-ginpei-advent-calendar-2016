<style>
</style>

<template>
  <div class="container">
    <h1>Vue Peraichi</h1>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    components: {
    },
    data: function () {
      return store.state
    },
    computed: {
    },
    methods: {
    }
  }
</script>
