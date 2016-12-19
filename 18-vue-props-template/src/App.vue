<template>
  <div class="gHeader">
    <user-list :users="users"></user-list>
  </div>
</template>

<script>
  const UserList = require('./UserList.vue')

  module.exports = {
    components: { UserList },
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
