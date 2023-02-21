<template>
  <div class="wrap">
    <router-view />
  </div>
</template>
<script lang="ts">
export default {
  components: {},
  data() {},

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
.wrap {
  display: flex;
  flex-direction: column;
  place-items: center;
  min-width: 320px;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  width: 100%;
}

@media only screen and (max-width: 980px) {
  .wrap {
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
