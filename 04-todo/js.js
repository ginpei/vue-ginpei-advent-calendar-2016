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
};

window.app = new Vue({
	el: '#app',
	components: {
		taskForm: taskForm,
		taskItem: taskItem,
	},
	data: {
		newTask: { name: '' },
		tasks: [
			{ name: 'Buy milk 2L' },
			{ name: 'Call to Alice' },
			{ name: 'Return books' },
		],
	},
	computed: {
	},
	methods: {
		newTask_submit: function(event) {
			console.log(this.newTask.name);  // TODO: implement

			this.newTask = { name: '' };
		},
	},
});
