const Vuex = require('vuex');

module.exports = new Vuex.Store({
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
