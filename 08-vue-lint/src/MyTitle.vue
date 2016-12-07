<template>
  <h1>{{title}}</h1>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    }
  }
</script>
