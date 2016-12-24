<style>
  body {  /* Sorry! */
    padding-top: 50px;
    min-height: 5000px;
  }
</style>

<template>
  <div>
    <g-header></g-header>
    <div class="container">
      <p>
        hash=[{{hash}}]
      </p>
      <section v-show="hash===''">
        <h1>Home</h1>
        <p>Sit est dolore quae ab illo nostrum quibusdam? Ratione consequuntur pariatur pariatur corrupti esse unde dolor Cupiditate voluptas voluptatibus ad deleniti deserunt Magnam dolores nobis labore cupiditate rem deleniti Incidunt!</p>
        <p>Lorem et commodi vero corporis ipsa. Sit iste tempore suscipit illum voluptatibus esse. Officiis impedit iure placeat illo odit. Enim pariatur eligendi tempora mollitia distinctio doloremque debitis, fuga Sapiente porro?</p>
        <p>Lorem unde consequatur asperiores quasi dignissimos magnam fugiat veritatis reprehenderit Nulla a blanditiis vero quidem quam Sed iusto ratione corporis porro maxime? Dolorem quisquam ad magni dolorum qui Maiores distinctio.</p>
      </section>
      <section v-show="hash==='#about'">
        <h1>About</h1>
        <p>Sit magni obcaecati laboriosam quo est, exercitationem! Earum id culpa ad sed excepturi. Repellat nam sit voluptatum perferendis iure. Blanditiis tempore est ab expedita eveniet Hic harum minus assumenda vero.</p>
      </section>
      <section v-show="hash==='#contact'">
        <h1>Contact</h1>
        <p>Ipsum ratione aperiam harum ducimus laborum Dicta animi libero ducimus beatae atque Dignissimos dolorem eius vitae assumenda iste, inventore, aut reprehenderit in. Similique alias ipsum quam cum veniam. Animi tenetur</p>
      </section>
    </div>
  </div>
</template>

<script>
  const GHeader = require('./GHeader.vue')
  const store = require('./store.js')

  module.exports = {
    components: { GHeader },
    data: function () {
      return store.state
    },
    computed: {
    },
    methods: {
    }
  }
</script>
