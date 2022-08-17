/**
 * 交付项目时场景不可留有log ***
 * 记得开启
 */
// const console = {
//   log: () => { }
// }

import { Utils } from "run-scene-v2";
import bus from "./Bus";
// 声明变量
let camera, scene, controls, renderer2, renderer, dom, t, p, runScene, Bus;
// 工具
const { getRes, getMacro } = Utils;
// 拿资源
const setAssets = (assets) => {
  camera = assets.camera;
  scene = assets.scene;
  controls = assets.controls;
  renderer = assets.renderer;
  dom = assets.engineDom;
  t = assets.t;
  // renderer2 = assets.renderer2;
  // p = assets.p;
};

//  页面接口总出口
function Change(runScene) {
  /* 拿资源 分解资源
        this挂载至t上
        runScene上的其他Api可以直接runScene.直接使用
    */
  setAssets({ ...runScene.assetsEx.get(), t: this, runScene });

  // 挂载runScene
  t.runScene = runScene;

  // 懒加载结束回调
  runScene.on("lazyLoadedTexture", () => { });

  // 加载后回调
  runScene.on("loaded", (a) => { });

  // 最后一帧加载回调
  runScene.on("complete", async () => {
    // 每帧渲染
    // t.runScene.cb.render.add("每帧渲染注册名称", () => { });

    /**
     * 注册事件
     * 均必须***需要等待场景加载到最后生命周期执行
     * (防止报错)***
     */
    this.events = new Events();

    this.cameraEvents = new CameraEvents();

    this.cameraEvents.init();

    // 入场动画
    this.events.cameraFoucs(
      {
        cx: -408.6402203306803,
        cy: 2170.9172175724293,
        cz: 1801.6939169137422,
        tx: 262.9568792114606,
        ty: -4.51860649292758,
        tz: -229.24462396311526,
      },
      2
    );

    controls.maxPolarAngle = Math.PI / 2 - 0.2;

    controls.screenSpacePanning = false;
  });

  // 模型特殊处理 加载初始不显示
  runScene.on("modelLoaded", (models) => {
    console.log(models, "models");
  });

  // 销毁
  this.dispose = () => runScene.dispose();
}

// 摄像机事件
class CameraEvents {
  // 相机表
  camerMap = {};

  init() {
    // 摄像机数据
    this.camerMap = {
      摄像头1: {
        dom: document.querySelector(".camera1"),
        model: t.runScene.modelEx.getModel("摄像头1"),
      },
      摄像头2: {
        dom: document.querySelector(".camera2"),
        model: t.runScene.modelEx.getModel("摄像头2"),
      },
    };
    this.domToScene();
    
  }

  // 转2d ui
  domToScene() {
    Object.keys(this.camerMap).map((i) => {
      const { dom, model } = this.camerMap[i];
      const sprite = Utils.domTo2Dui(dom);
      // const sprite = Utils.domTo3DSprite(dom);
      sprite.scale.set(0.001, 0.001, 0.001);
      sprite.name = i.toString();
      sprite.visible = false;
      this.camerMap[i][`sprite`] = sprite;
      model.add(sprite);
      console.log("this.camerMap",this.camerMap);
    });
  }

  // 显示监控
  isShowCamera(model) {
    const name = model.name;
    if (this.camerMap[name]) {
      const { sprite } = this.camerMap[name];
      sprite.visible = !sprite.visible;
    } else {
      this.recoveryCamera();
    }
  }

  // 相机设置为不显示
  recoveryCamera() {
    Object.keys(this.camerMap).map((i) => {
      const { sprite } = this.camerMap[i];
      sprite.visible = false;
    });
  }
  // 设置指定相机不显示
  recoveryAssignCamera(name) {
    if (this.camerMap[name]) {
      const { sprite } = this.camerMap[name];
      sprite.visible = false;
    } else {
      this.recoveryCamera();
    }
  }
}

// 基本事件
class Events {
  constructor() {
    controls.addEventListener("start", this.controlStart);
    t.runScene.cb.events.pointer.down.add("pointerDown", this.mouseDown);
    t.runScene.cb.events.pointer.up.add("pointerUp", this.mouseUp);
    t.runScene.cb.events.mouse.move.add("mouseMove", () => { });
  }

  showAnima(info) {
    const { model, isShow, time, cb, opacity } = info;
    const models = [];
    model.traverse((m) => {
      if (m.type === "Group") return;
      if (m.type === "Object3D") return;
      m.material.transparent = true;
      isShow ? (m.material.opacity = 0) : null;
      models.push(m);
    });
    if (isShow) model.visible = isShow;
    Utils.anima(
      { opc: isShow ? 0 : opacity || 1 },
      { opc: isShow ? opacity || 1 : 0 },
      time,
      (data) => {
        models.map((m) => (m.material.opacity = data.opc));
      },
      () => {
        if (!isShow) model.visible = isShow;
        cb && cb();
      }
    );
  }

  // 相机聚焦动画
  cameraFoucs(position, time = 1) {
    t.events.closeAnimaAtStart.anima = Utils.anima(
      {
        cx: t.runScene.assetsEx.camera.position.x,
        cy: t.runScene.assetsEx.camera.position.y,
        cz: t.runScene.assetsEx.camera.position.z,
        tx: t.runScene.assetsEx.controls.target.x,
        ty: t.runScene.assetsEx.controls.target.y,
        tz: t.runScene.assetsEx.controls.target.z,
      },
      {
        ...position,
      },
      time,
      (data) => {
        t.runScene.assetsEx.camera.position.set(data.cx, data.cy, data.cz);
        t.runScene.assetsEx.controls.target.set(data.tx, data.ty, data.tz);
        t.runScene.assetsEx.camera.updateProjectionMatrix();
        t.runScene.assetsEx.controls.update();
      }
    );
  }

  downPosition = { x: 0, y: 0 };

  closeAnimaAtStart = { enterAnima: "" };

  mouseDown = (event) => {
    this.downPosition = {
      x: event.offsetX,
      y: event.offsetY,
    };
  };

  mouseUp = (event) => {
    if (event.button === 2) return;
    const ux = event.offsetX;
    const uy = event.offsetY;
    const { x, y } = this.downPosition;
    // 当点击的位置和点击后的位置一致时就会触发
    ux === x && uy === y && this.triggerClick(event);
  };

  triggerClick = (e) => {
    const model = t.runScene.modelEx.select;
    if (!model) return;
    console.log(
      `cx:${camera.position.x},cy:${camera.position.y},cz:${camera.position.z},tx:${controls.target.x},ty:${controls.target.y},tz:${controls.target.z}`,
      "位置"
    );
    if (model) {
      bus.emit("logClickModel", model);
      t.cameraEvents.isShowCamera(model);
      if (model.name === "摄像头1") {
        t.events.cameraFoucs(
          {
            cx: -1320.1516084634357, cy: 2142.6462404266485, cz: 1290.7785801820423, tx: 387.313085, ty: 296.623976, tz: -237.28282
          },
          2
        );
        t.cameraEvents.recoveryAssignCamera("摄像头2")
      }


      if (model.name === "摄像头2") {
        t.events.cameraFoucs(
          {
            cx:-457.99498995928593,cy:1712.9249357924837,cz:2199.4673456718438,tx:387.313085,ty:296.623976,tz:-237.28282
          },
          2
        );
        t.cameraEvents.recoveryAssignCamera("摄像头1")
      }
    } else {
      // 未点击到任何模型即也将 画面模型隐藏
      t.cameraEvents.recoveryCamera();
    }
    // console.log("位置", `cx:${camera.position.x}, cy:${camera.position.y}, cz:${camera.position.z}, tx:${controls.target.x}, ty:${controls.target.y}, tz:${controls.target.z} `);
  };

  controlStart = () => { };

  closeAnmia() {
    Object.values(this.closeAnimaAtStart).map(
      (item) =>
        // 暂停动画 并清空内容 item就是那个动画
        item && item.kill()
    );
  }

  dispose() {
    dom.removeEventListener("pointerdown", this.mouseDown);
    dom.removeEventListener("pointerup", this.mouseUp);
    controls.removeEventListener("start", this.controlStart);
  }
}

export default Change;

/* 常用run-scene-v--API 详细的github自取
   版本更新飞书自查
*/

/**
 * 获取模型
 * t.runScene.modelEx.getModel('');
 *
 * 基本的场景配置
 * controls.maxPolarAngle = Math.PI / 2 - 0.2;
 * controls.screenSpacePanning = false;
 *
 * 转dom
 * Utils.domTo3DSprite(dom);
 * Utils.domTo2Dui(dom);
 * Utils.domTo3Dui(dom);
 *
 * 相机当前位置以及视角
 * Utils.getCamAnimaData()
 *
 * 宏任务(自带清计时器)
 * Utils.getMacro(()={},time)
 *
 * 补帧动画
 * Utils.anima({},{},time,(data)=>{},()=>{})
 *
 * */