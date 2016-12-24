<style>
  body {  /* Sorry! */
    padding-top: 50px;
    min-height: 5000px;
  }
</style>

<template>
  <div>
    <g-header></g-header>
    <div class="container">
      <p>
        hash=[{{hash}}]
      </p>
    </div>
  </div>
</template>

<script>
  const GHeader = require('./GHeader.vue')
  const store = require('./store.js')

  module.exports = {
    components: { GHeader },
    data: function () {
      return store.state
    },
    computed: {
    },
    methods: {
    }
  }
</script>
