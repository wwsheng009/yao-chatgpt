<template>
  <!-- <div id="nav"></div> -->
  <router-view />
</template>
<script lang="ts">
export default {
  components: {},
  created() {
    this.changeHeightEventHandler();

    window.addEventListener("resize", this.changeHeightEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.changeHeightEventHandler);
  },

  methods: {
    changeHeightEventHandler() {
      document.body.style.height = `${window.innerHeight}px`;

      document.documentElement.style.setProperty(
        "--viewport-height",
        `${window.innerHeight}px`
      );
    },
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  width: 100%;
}

@media only screen and (max-width: 980px) {
  #app {
    padding: 0.5rem;
  }
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
