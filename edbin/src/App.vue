<style>
</style>

<template>
  <h1>{{message}}</h1>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    }
  }
</script>
