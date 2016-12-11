const Vuex = require('vuex')

module.exports = new Vuex.Store({
  state: {
    text: '',
    number: 0,
    radio: 'radio1',
    radioOptions: [
      { label: 'ラジオ1', value: 'radio1' },
      { label: 'ラジオ2', value: 'radio2' },
      { label: 'ラジオ3', value: 'radio3' },
      { label: 'ラジオ4', value: 'radio4' },
      { label: 'ラジオ5', value: 'radio5' }
    ],
    checkboxes: [
      { label: 'チェック1', value: 'check1', checked: false },
      { label: 'チェック2', value: 'check2', checked: false },
      { label: 'チェック3', value: 'check3', checked: false },
      { label: 'チェック4', value: 'check4', checked: false },
      { label: 'チェック5', value: 'check5', checked: false }
    ],
    select: 'select1',
    selectOptions: [
      { label: 'セレクト1', value: 'select1' },
      { label: 'セレクト2', value: 'select2' },
      { label: 'セレクト3', value: 'select3' },
      { label: 'セレクト4', value: 'select4' },
      { label: 'セレクト5', value: 'select5' }
    ],
    multiSelect: [],
    multiSelectOptions: [
      { label: 'セレクト1', value: 'select1' },
      { label: 'セレクト2', value: 'select2' },
      { label: 'セレクト3', value: 'select3' },
      { label: 'セレクト4', value: 'select4' },
      { label: 'セレクト5', value: 'select5' }
    ]
  },
  mutations: {
  }
})
