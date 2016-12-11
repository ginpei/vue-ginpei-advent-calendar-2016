<style>
</style>

<template>
  <div class="container">
    <h1>Ajax Form</h1>
    <form @submit.prevent="form_submit" action="/send/something" method="POST">
      <div class="form-group">
        <label for="text">テキスト</label>
        <input v-model="text" id="text" class="form-control" type="text" name="text" placeholder="あいうえお" />
      </div>
      <div class="form-group">
        <label for="number">数値</label>
        <input v-model.number="number" id="number" class="form-control" type="number" name="number" placeholder="3.14" />
      </div>
      <div class="form-group">
        <ul>
          <li v-for="r in radioOptions" class="radio">
            <label>
              <input v-model="radio" :value="r.value" type="radio" name="radio" />
              {{r.label}}
            </label>
          </li>
        </ul>
      </div>
      <div class="form-group">
        <ul>
          <li v-for="c in checkboxes" class="checkbox">
            <label>
              <input v-model="c.checked" :value="c.value" type="checkbox" name="checkbox" />
              {{c.label}}
            </label>
          </li>
        </ul>
      </div>
      <div class="form-group">
        <label for="select">セレクトボックス（単数）</label>
        <select v-model="select" id="select" class="form-control">
          <option v-for="s in selectOptions" :value="s.value">
            {{s.label}}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="multiSelect">セレクトボックス（複数）</label>
        <select v-model="multiSelect" id="multiSelect" class="form-control" multiple>
          <option v-for="s in multiSelectOptions" :value="s.value">
            {{s.label}}
          </option>
        </select>
      </div>
      <button class="btn btn-primary">送信</button>
    </form>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    },
    methods: {
      form_submit (event) {
        const data = {
          text: this.text,
          number: this.number,
          radio: this.radio,
          checkboxes: this.checkboxes.filter(v => v.checked).map(v => v.value),
          select: this.select,
          multiSelect: this.multiSelect
        }
        console.log(data)
      }
    }
  }
</script>
