<style>
</style>

<template>
	<label class="list-group-item">
		<span v-on:click.prevent="edit_click" class="pull-right btn btn-link">Edit</span>
		<input v-model="task.finished" type="checkbox">
		{{task.name}}
	</label>
</template>

<script>
module.exports = {
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
</script>
