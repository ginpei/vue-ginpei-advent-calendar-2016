<style>
  .taskListOperator {
    text-align: right;
    margin-bottom: 1em;
  }
</style>

<template>
  <div class="container">
    <h1>Vue TODO</h1>
    <div>
      <task-form :task="newTask"></task-form>
    </div>
    <hr />
    <div class="taskListOperator">
      <button v-on:click="delete_click" class="btn btn-default">Delete finished tasks</button>
    </div>
    <div class="list-group">
      <task-item v-for="task in tasks" :task="task"></task-item>
      <p v-show="tasks.length < 1" class="text-muted">No tasks. Yay!</p>
    </div>
  </div>
</template>

<script>
  var TaskForm = require('./TaskForm.vue')
  var TaskItem = require('./TaskItem.vue')
  var store = require('./store.js')

  module.exports = {
    components: {
      taskForm: TaskForm,
      taskItem: TaskItem
    },
    data: function () {
      return store.state
    },
    computed: {
    },
    methods: {
      delete_click: function (event) {
        this.tasks = this.tasks.filter(v => !v.finished)
      }
    }
  }
</script>
