<style>
  .form-files-imagePreview {
    max-height: 100px;
    max-width: 100px;
  }

  /* http://qiita.com/ginpei/items/d9fe884574d8b5751f07 */
  .ajaxButton {
    overflow: hidden;
    position: relative;
  }
  .ajaxButton.loading::before {
    background-color: rgba(0,0,0,.5);
    content: "";
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
  .ajaxButton.loading::after {
    animation: rotate 1s infinite linear;
    content: "*";
    color: #fff;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
  @keyframes rotate {
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
  }
</style>

<template>
  <div class="container">
    <h1>Ajax Form</h1>
    <form @submit.prevent="form_submit" action="/send/something" method="POST">
      <div class="form-group">
        <label for="text">テキスト</label>
        <input v-model="form.text" id="text" class="form-control" type="text" name="text" placeholder="あいうえお" />
      </div>
      <div class="form-group">
        <label for="number">数値</label>
        <input v-model.number="form.number" id="number" class="form-control" type="number" name="number" placeholder="3.14" />
      </div>
      <div class="form-group">
        <ul>
          <li v-for="r in form.radioOptions" class="radio">
            <label>
              <input v-model="form.radio" :value="r.value" type="radio" name="radio" />
              {{r.label}}
            </label>
          </li>
        </ul>
      </div>
      <div class="form-group">
        <ul>
          <li v-for="c in form.checkboxes" class="checkbox">
            <label>
              <input v-model="c.checked" type="checkbox" name="checkbox" />
              {{c.label}}
            </label>
          </li>
        </ul>
      </div>
      <div class="form-group">
        <label for="select">セレクトボックス（単数）</label>
        <select v-model="form.select" id="select" class="form-control">
          <option v-for="s in form.selectOptions" :value="s.value">
            {{s.label}}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="multiSelect">セレクトボックス（複数）</label>
        <select v-model="form.multiSelect" id="multiSelect" class="form-control" multiple>
          <option v-for="s in form.multiSelectOptions" :value="s.value">
            {{s.label}}
          </option>
        </select>
      </div>
      <p>
        <button :class="{ loading: sending }" :disabled="sending" class="btn btn-primary ajaxButton">送信</button>
        <label><input v-model="form.bad" type="checkbox" name="bad" /> Bad Request (400)</label>
      </p>
    </form>
  </div>
</template>

<script>
  const axios = require('axios')
  var form = require('./form.js')

  module.exports = {
    data: function () {
      return {
        form: form.state,
        sending: false
      }
    },
    methods: {
      form_submit (event) {
        const data = {
          text: this.form.text,
          number: this.form.number,
          radio: this.form.radio,
          checkboxes: this.form.checkboxes
            .filter(v => v.checked)
            .map(v => v.value),
          select: this.form.select,
          multiSelect: this.form.multiSelect,
          bad: this.form.bad
        }
        this._submit(data)
      },

      _submit (data) {
        this.sending = true

        const URL = './echo.php'
        axios.post(URL, data)
          .then(res => {
            this.sending = false
            console.log(res.data)
          }, error => {
            this.sending = false
            throw error
          })
      }
    }
  }
</script>
