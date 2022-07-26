<style lang="less" scoped>
.flv-player {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <video class="flv-player" controls ref="flv-player"></video>
</template>

<script>
import flvjs from "flv.js";
export default {
  name: "flv-player-ws",
  props: {
    url: String,
    type: String,
    ws: String,
  },
  data() {
    return {
      flvPlayer: null,
    };
  },
  methods: {
    loadFlv() {
      if (!this.url) return;
      if (!this.type) return;
      if (!this.ws) return;
      // return
      if (flvjs.isSupported()) {
        this.flvPlayer = flvjs.createPlayer({
          type: this.type,
          isLive: true,
          hasAudio: false,
          url: this.ws + "?url=" + this.url,
        });
        this.flvPlayer.attachMediaElement(this.$refs["flv-player"]);
        this.flvPlayer.load();
        this.flvPlayer.play();
      }
    },
    destoryFlv() {
      if (this.flvPlayer) {
        this.flvPlayer.pause();
        this.flvPlayer.unload();
        this.flvPlayer.detachMediaElement();
        this.flvPlayer.destroy();
        this.flvPlayer = null;
      }
    },
    stop() {
      if (this.flvPlayer) {
        this.flvPlayer.pause();
      }
    },
    play() {
      if (this.flvPlayer) {
        this.flvPlayer.play();
      }
    },
  },
  mounted() {
    this.loadFlv();
  },
  created() {
    this.destoryFlv();
  },
};
</script>
