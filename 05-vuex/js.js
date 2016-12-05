/* global window, Vue */

var taskForm = {
	template: '#template-task-form',
	props: [
		'task',
		'on-submit',
	],
	methods: {
		form_submit: function(event) {
			if (!this.task.name) {
				return;
			}

			this.onSubmit(event, this.task);
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
	data: {
		newTask: { finished: false, name: '' },
		tasks: [
			{ finished: false, name: 'Buy milk 2L' },
			{ finished: false, name: 'Call to Alice' },
			{ finished: false, name: 'Return books' },
		],
	},
	computed: {
	},
	methods: {
		newTask_submit: function(event) {
			this.tasks.unshift(this.newTask);
			this.newTask = { finished: false, name: '' };
		},

		delete_click: function(event) {
			this.tasks = this.tasks.filter(v=>!v.finished);
		},
	},
});
