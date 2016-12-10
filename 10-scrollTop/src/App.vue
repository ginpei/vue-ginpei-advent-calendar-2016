<style>
  body {
    height: 3000px;
  }
  .scrollTop {
    left: 0;
    position: fixed;
    top: 0;
  }
</style>

<template>
  <div class="scrollTop">Top: {{scrollTop}}</div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    }
  }
</script>
