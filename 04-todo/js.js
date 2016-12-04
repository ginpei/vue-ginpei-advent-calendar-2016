/* global window, Vue */

var taskForm = {
	template: '#template-task-form',
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
		tasks: [
			{ name: 'Buy milk 2L' },
			{ name: 'Call to Alice' },
			{ name: 'Return books' },
		],
	},
	computed: {
	},
	methods: {
	},
});
