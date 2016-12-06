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
