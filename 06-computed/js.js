var app = new Vue({
	el: '#app',
	data: {
		firstName: 'ginpei',
		lastName: 'takanashi',
	},
	computed: {
		initial: function() {
			var firstFirstNameLetter = this.getInitialOf(this.firstName);
			var firstLastNameLetter = this.getInitialOf(this.lastName);

			var initial = firstFirstNameLetter + '.' + firstLastNameLetter + '.';
			return initial;
		},
	},
	methods: {
		/**
		 * @param {string} name
		 * @returns {string}
		 * @example
		 * this.getInitialOf("alice");  // => "A"
		 */
		getInitialOf: function(name) {
			return name.charAt(0).toUpperCase();
		},
	},
});

// --------------------------------

var app2 = new Vue({
	el: '#app2',
	components: {
		userItem: {
			template: '<li>{{initial}}</li>',
			props: [
				'user',
			],
			computed: {
				initial: function() {
					var initial =
						this.user.firstName.charAt(0).toUpperCase() + '.' +
						this.user.lastName.charAt(0).toUpperCase() + '.';
					return initial;
				},
			},
		},
	},
	data: {
		users: [
			{ firstName: 'ginpei', lastName: 'takanashi' },
			{ firstName: 'kintoki', lastName: 'sakata' },
			{ firstName: 'noriko', lastName: 'takaya' },
		],
	},
});
