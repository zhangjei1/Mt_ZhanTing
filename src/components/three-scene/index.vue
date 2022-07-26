<template>
  <div class="three-scene" ref="three-scene" onselectstart="return false;">
    <div
      class="btn"
      @pointerdown="
        (e) => {
          // e.preventDefault();
          e.stopPropagation();
        }
      "
    ></div>
    <div class="camera camera1">
      <div class="delete" @pointerdown="noShow">X</div>
      <monitor
        v-show="showCamera1"
        url="2"
        ws="ws://192.168.3.8:8888/rtsp/"
        type="flv"
      ></monitor>
    </div>
    <div class="camera camera2">
      <div class="delete" @pointerdown="oneShow">X</div>
      <monitor
        v-show="showCamera2"
        url="1"
        ws="ws://192.168.3.8:8888/rtsp/"
        type="flv"
      ></monitor>
    </div>
  </div>
</template>

<script>
import Change from "./Change";
import { RunScene, Utils } from "run-scene-v2";
import bus from "./Bus";
import monitor from "./camera.vue";
// 场景的传值Bus
export default {
  components: {
    monitor,
  },
  data() {
    return {
      change: null,
      runScene: null,
      isShow: false,
      Bus: bus,
      showCamera1: false,
      showCamera2: false,
    };
  },
  mounted() {
    // 加载场景
    this.loadScene();
    // 打印点击的模型接口
    // bus.$on("logClickModel", this.logClickModel);

    bus.on("showCamera", () => {
      // this.isShow = !this.isShow;
      this.showCamera1 = true;
    });
    bus.on("showCameraOne", () => {
      // this.isShow = !this.isShow;
      this.showCamera2 = true;
      console.log("11");
    });
  },
  methods: {
    // 加载场景
    loadScene() {
      this.runScene = new RunScene({
        // path: "https://test2-1303915342.cos.ap-shanghai.myqcloud.com/DreamShowroom/scene.glb",
        path: "./assets/scene.glb",
        rootDom: this.$refs["three-scene"],
        options: {
          // notTexture: true,
          render2: true,
          // render3: true,
        },
        // controlsUpdate: false,
      });
      this.change = new Change(this.runScene, this.onDone);
    },
    onDone() {
      console.log("场景加载结束~");
    },
    // 打印点击到的模型
    logClickModel(model) {
      console.log("点击的模型为:", model.name);
    },
    // 事件一
    events1() {
      console.log(1);
    },
    noShow() {
      this.change.Camera.CameraModeHidden();
      console.log("11");
    },
    oneShow() {
      this.change.Camera.CameraModeOneHidden();
    },
  },
};
</script>

<style lang="less" scoped>
.three-scene {
  width: 100vw;
  height: 100vh;
  position: relative;
  .btn {
    z-index: 10;
    position: absolute;
    .floor {
      button {
        color: black;
      }
    }
  }
  .camera {
    // position: absolute;
    // bottom: -20%;
    // z-index: 2;
    // width: 25%;
    // height: 25%;
    // background-color: rgba(0, 183, 255, 0.215);
    // position: absolute;
    // bottom: 10%;
    width: 25%;
    // height: 252px;
    opacity: 0;
  }

  .camera1 {
    .camera;
    // left: 19%;
  }

  .camera2 {
    .camera;
    // right: -54%;
  }
  .delete {
    position: absolute;
    top: 1%;
    left: 94%;
    width: 5%;
    height: 10%;
    // background-color: rgb(0, 55, 255);
    z-index: 10;
    text-align: center;
    line-height: 30px;
  }

  .oth {
    position: absolute;
    z-index: 2;
  }
  .show {
    opacity: 1 !important;
  }
  .none {
    opacity: 0 !important;
  }
}
.shopBorder {
  z-index: 100;
  position: absolute;
  width: 50px;
  height: 50px;
  // background-color: red;
  opacity: 0;
}
.showOpacity {
  opacity: 1 !important;
}
</style>
