/* global window, Vue */

var store = new Vuex.Store({
	state: {
		newTask: { finished: false, name: '' },
		tasks: [
			{ finished: false, name: 'Buy milk 2L' },
			{ finished: false, name: 'Call to Alice' },
			{ finished: false, name: 'Return books' },
		],
	},
	mutations: {
		add: function(state) {
			state.tasks.unshift(state.newTask);
			state.newTask = { finished: false, name: '' };
		},
	},
});

var taskForm = {
	template: '#template-task-form',
	props: [
		'task',
	],
	methods: {
		form_submit: function(event) {
			if (!this.task.name) {
				return;
			}

			store.commit('add');
		},
	},
};

var taskItem = {
	template: '#template-task-item',
	props: [
		'task',
	],
	methods: {
		edit_click: function(event) {
			// update if not canceled
			var newName = window.prompt('Task Name', this.task.name);
			if (typeof newName === 'string') {
				this.task.name = newName;
			}
		},
	},
};

window.app = new Vue({
	el: '#app',
	components: {
		taskForm: taskForm,
		taskItem: taskItem,
	},
	data: store.state,
	computed: {
	},
	methods: {
		delete_click: function(event) {
			this.tasks = this.tasks.filter(v=>!v.finished);
		},
	},
});
