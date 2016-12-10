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
  <div class="container">
    <h1>Vue Peraichi</h1>
    <div class="scrollTop">Top: {{scrollTop}}</div>
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
