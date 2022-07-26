<template>
  <router-view />
</template>

<script>
export default {
  created() {},
  mounted() {
    const app = document.querySelector("#app");
    const resize = () => {
      const { height } = app.getBoundingClientRect();
      app.style.width = (16 / 9) * height + "px";
    };
    window.onresize = () => {
      resize();
    };
    resize();
  },
};
</script>
<style lang="less">
html,
body {
  margin: 0px !important;
  overflow: hidden;
  background-color: black;
}

#app {
  margin: 0px auto;
  width: 100vw;
  height: 100vh;
}
</style>
