<style>
  .form-files-imagePreview {
    max-height: 100px;
    max-width: 100px;
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
      <div class="form-group">
        <label for="file">ファイル（複数）</label>
        <input @change="file_change" class="form-control" type="file" multiple />
      </div>
      <ul v-if="file.files.length > 0">
        <li v-for="(file, index) in file.files">
          {{index + 1}}
          <ul>
            <li>名前: {{file.name}}</li>
            <li>サイズ: {{file.size}}</li>
            <li>種類: {{file.type}}</li>
            <li v-if="file.previewImageSrc">
              <img :src="file.previewImageSrc" :alt="`${file.name}のプレビュー画像`" class="form-files-imagePreview" />
            </li>
            <li v-if="file.textContent">
              ファイル冒頭:
              {{file.textContent.slice(0, 128)}}
              <template v-if="file.textContent.length > 128">…</template>
            </li>
          </ul>
        </li>
      </ul>
      <button class="btn btn-primary">送信</button>
    </form>
  </div>
</template>

<script>
  var form = require('./form.js')
  var file = require('./file.js')

  module.exports = {
    data: function () {
      return {
        file: file.state,
        form: form.state
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
          multiSelect: this.form.multiSelect
        }
        console.log(data)

        const checkboxes = this.form.checkboxes
          .reduce((o, v) => { o[v.value] = v.checked; return o }, {})
        console.log('checkboxes', checkboxes)
      },

      file_change (event) {
        const files = event.target.files
        file.commit('setFiles', files)
      }
    }
  }
</script>
