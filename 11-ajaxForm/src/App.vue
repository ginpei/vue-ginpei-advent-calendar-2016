<style>
</style>

<template>
  <div class="container">
    <h1>Ajax Form</h1>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    }
  }
</script>
