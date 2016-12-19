<template>
  <ul>
    <user-item v-for="u in users" :name="u.name" :age="u.age"></user-item>
  </ul>
</template>

<script>
  const pt = require('vue-props-template')
  const UserItem = require('./UserItem.vue')

  module.exports = {
    components: { UserItem },
    props: pt`
      array users
    `
  }
</script>
