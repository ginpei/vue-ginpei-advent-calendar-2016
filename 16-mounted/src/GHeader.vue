<style>
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
  .gHeader-link-item {
    display: inline-block;
    float: left;
    height: 100%;
    text-align: center;
    width: 100px;
  }
  .gHeader-link-itemUnderline {
    background-color: #69f;
    bottom: 0;
    content: "";
    display: block;
    height: 3px;
    left: 0;
    position: absolute;
    transition: transform 200ms;
    width: 100px;
  }
</style>

<template>
  <div class="gHeader">
    <div class="gHeader-logo">
      LOGO
    </div>
    <nav ref="list" class="gHeader-link-list">
      <a class="gHeader-link-item" href="#">Home</a>
      <a class="gHeader-link-item" href="#about">About</a>
      <a class="gHeader-link-item" href="#contact">Contact</a>
      <span :style="underlineStyle" class="gHeader-link-itemUnderline"></span>
    </nav>
  </div>
</template>

<script>
  const store = require('./store.js')

  module.exports = {
    data () {
      return {
        itemWidth: 999,
        hashes: [],
        state: store.state
      }
    },
    mounted () {
      const elList = this.$refs.list
      const elItems = elList.children

      this.itemWidth = elItems[0].clientWidth

      this.hashes = Array.from(elItems).map(elItem => {
        let hash = elItem.getAttribute('href')
        if (hash === '#') {
          hash = ''
        }
        return hash
      })
    },
    computed: {
      underlineStyle () {
        const left = this.itemWidth * this.hashes.indexOf(this.state.hash)
        return {
          transform: 'translateX(' + left + 'px)'
        }
      }
    },
    methods: {
    }
  }
</script>
