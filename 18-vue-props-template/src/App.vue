<template>
  <div class="gHeader">
    <ul>
      <user-item v-for="u in users" :name="u.name" :age="u.age"></user-item>
    </ul>
  </div>
</template>

<script>
  const UserItem = require('./UserItem.vue')

  module.exports = {
    components: { UserItem },
    data: function () {
      return {
        users: [
          { name: 'Alice', age: 11 },
          { name: 'Bob', age: 22 },
          { name: 'Charlie', age: 'thirty-three' }  // Oops!
        ]
      }
    }
  }
</script>
