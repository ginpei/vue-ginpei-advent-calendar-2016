<template>
  <li>{{name}} is {{age}} years old.</li>
</template>

<script>
  const pt = require('vue-props-template')

  module.exports = {
    props: pt`
      string name
      number age
    `
  }
</script>
