<style>
  body {
    padding-top: 50px;
    min-height: 5000px;
  }
  .gHeader {
    background-color: #f8f8f8;
    border-bottom: 1px solid #e7e7e7;
    display: flex;
    height: 50px;
    line-height: 50px;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
  .gHeader-logo {
    text-align: center;
    width: 100px;
  }
  .gHeader-link-list {
    position: relative;
  }
  .gHeader-link-list::before {
    background-color: #69f;
    bottom: 0;
    content: "";
    display: block;
    height: 3px;
    left: 0;
    position: absolute;
    width: 100px;
  }
  .gHeader-link-item {
    display: inline-block;
    height: 100%;
    text-align: center;
    width: 100px;
  }
</style>

<template>
  <div>
    <div class="gHeader">
      <div class="gHeader-logo">
        LOGO
      </div>
      <nav class="gHeader-link-list">
        <a class="gHeader-link-item" href="#">Home</a>
        <a class="gHeader-link-item" href="#about">About</a>
        <a class="gHeader-link-item" href="#contact">Contact</a>
      </nav>
    </div>
    <div class="container">
      <p>
        hash=[{{hash}}]
      </p>
    </div>
  </div>
</template>

<script>
  var store = require('./store.js')

  module.exports = {
    data: function () {
      return store.state
    },
    methods: {
    }
  }
</script>
