<style>
</style>

<template>
  <form v-on:submit.prevent="form_submit">
    <div class="input-group">
      <input v-model="task.name" class="form-control" type="text" placeholder="Buy milk 2L">
      <span class="input-group-btn">
        <button class="btn btn-primary">Add new task</button>
      </span>
    </div>
  </form>
</template>

<script>
  const store = require('./store.js')

  module.exports = {
    props: [
      'task'
    ],
    methods: {
      form_submit: function (event) {
        if (!this.task.name) {
          return
        }

        store.commit('add')
      }
    }
  }
</script>
