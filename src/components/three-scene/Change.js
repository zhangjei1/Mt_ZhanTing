// const console = {
//   log: () => { }
// }

// 声明变量
import bus from './Bus'
import { Utils } from "run-scene-v2";
import * as THREE from "three";
let camera, scene, controls, renderer2, renderer, dom, t, p, runScene, Bus;
Bus = bus
// 拿资源
const setAssets = (assets) => {
  camera = assets.camera;
  scene = assets.scene;
  controls = assets.controls;
  // renderer2 = assets.renderer2;
  renderer = assets.renderer;
  dom = assets.engineDom;
  t = assets.t;
  // p = assets.p;
};
// 整体场景事件
function Change(runScene, onDone) {
  /* 拿资源 分解资源 
      this挂载至t上 
      runScene上的其他Api可以直接runScene.直接使用
  */
  setAssets({ ...runScene.assetsEx.get(), t: this, runScene });
  this.getModel = (name) => {
    const id = runScene.uniqueEx.model.nameMap[name];
    if (!id) return;
    return runScene.uniqueEx.model.get(id);
  };
  // 挂载runScene
  t.runScene = runScene;

  console.log(runScene, "runScene");
  console.log(Utils, "Utils");


  //入场动画
  this.entryAnima = () => {
    runScene.modelEx.camAnima(
      runScene.modelEx.getCamLocal(),
      {
        cx:101.51047171910608,cy:1507.888677626636,cz:1584.0585568415909,tx:306.3070021011309,ty:296.623976,tz:-196.23492809703617 
      },
      1.5
    );
  };
  // {x:583.8576970686372,y:105.97789189016927,z:-702.7101195714305}

  // this.demo = new Demo();

  // 加载结束
  runScene.on("lazyLoadedTexture", () => {
    // 初始化解析json
    // 初始化解析数据添加模型
    // this.addModel.init();
    // this.resolveJson.addModel();
    // this.demo.init();
    // this.tower.init();
    // this.shop.init();
    // this.shop.shopPersonEvent();

    controls.maxPolarAngle = Math.PI / 2 - 0.2;
    controls.screenSpacePanning = false;

    onDone();
  });

  runScene.on("complete", () => {
    this.entryAnima();

    // 解析数据
    // this.resolveJson = new ResolveJson();
    this.events = new Events();
    this.methods = new Methods();
    this.Camera = new Camera()
    this.Camera.init()

  });

  // 销毁
  this.dispose = () => runScene.dispose();
}
// runScene.modelEx.clone('model')
// t.runScene.modelEx.clone()
// 基本事件
class Events {
  constructor() {
    controls.addEventListener("start", this.controlStart);
    t.runScene.cb.events.pointer.down.add(
      "pointerDown",
      this.mouseDown
    );
    t.runScene.cb.events.pointer.up.add("pointerUp", this.mouseUp);
    t.runScene.cb.events.mouse.up.add("mouseUp", this.mouseUp);
    t.runScene.cb.events.mouse.move.add("mouseMove", () => { });
    t.runScene.cb.render.add("test", () => {
      t.runScene.assetsEx.controls.update();
    });
  }
  downPosition = { x: 0, y: 0 };

  closeAnimaAtStart = {};

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
    console.log("点击到的模型:", model, model.name);
    console.log(
      `cx:${camera.position.x},cy:${camera.position.y},cz:${camera.position.z},tx:${controls.target.x},ty:${controls.target.y},tz:${controls.target.z}`,
      "位置"
    );

    if (model.name === "摄像头1") {
      t.Camera.CameraModeShow()
      t.events.cameraFoucs(
        {
          cx:-215.0925207277506,cy:1344.3532850360634,cz:1135.2703397916925,tx:77.812919,ty:296.623976,tz:-250.483781
        },
        2
      );
    } else {
      t.Camera.CameraModeHidden()
    }

    if (model.name === "摄像头2") {
      t.Camera.CameraModeOneShow()
      t.events.cameraFoucs(
        {
          cx:-242.2893286894415,cy:1284.0330977365038,cz:1324.553015642677,tx:387.313085,ty:296.623976,tz:-237.28282
        },
        2
      );
    } else {
      t.Camera.CameraModeOneHidden()
    }


  };

  controlStart = () => {
    // 清除动画
    Object.values(this.closeAnimaAtStart).map((i) => {
      i && i.kill();
    });
  };

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


  // 视角转换
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

}


class Camera {
  // 摄像头1模型
  Cameramodel = null;
  // 摄像头2dom模型
  CameramodelOne = null;
  // 摄像头1 2D元素
  Camersprite = null;
  // 摄像头2 2D元素
  CamerspriteOne = null
  init() {
    this.createDom()
  }
  createDom() {
    Utils.getMacro(() => {

      let createDom = document.querySelectorAll(".camera")
      let timer = setTimeout(() => {
        createDom[0].classList.add('show');
        createDom[1].classList.add('show');
        clearTimeout(timer)
      }, 100);


      this.Cameramodel = t.runScene.modelEx.getModel("摄像头1")
      // this.Camersprite = Utils.domTo3DSprite(createDom[0])
      this.Camersprite = Utils.domTo2Dui(createDom[0])
      this.Camersprite.visible = false;

      this.Camersprite.position.x += 130
      this.Camersprite.position.y += 500
      t.runScene.modelEx.add(this.Camersprite)

      this.CameramodelOne = t.runScene.modelEx.getModel("摄像头2")
      // this.CamerspriteOne = Utils.domTo3DSprite(createDom[1])
      this.CamerspriteOne = Utils.domTo2Dui(createDom[1])
      this.CamerspriteOne.visible = false;

      this.CamerspriteOne.position.x += 1350
      this.CamerspriteOne.position.y += 400
      t.runScene.modelEx.add(this.CamerspriteOne)
    })
  }

  CameraModeShow() {
    bus.emit('showCamera')
    this.Camersprite.visible = true;
  }
  CameraModeHidden() {
    this.Camersprite.visible = false;
  }

  CameraModeOneShow() {
    bus.emit('showCameraOne')
    this.CamerspriteOne.visible = true;
  }
  CameraModeOneHidden() {
    this.CamerspriteOne.visible = false;
  }

}
//方法
class Methods {
  //获取模型
  getModel(name) {
    return t.runScene.modelEx.getModel(name);
  }
  //相机动画
  camAnima(view, time, callback) {
    t.runScene.modelEx.camAnima(
      t.runScene.modelEx.getCamLocal(),
      view,
      time,
      () => {
        callback && callback();
      }
    );
  }
  //场景自转
  autoRotation(isRotate, speed, lookat) {
    t.runScene.assetsEx.controls.autoRotate = isRotate;
    t.runScene.assetsEx.controls.autoRotateSpeed = speed;
    lookat && t.runScene.camera.lookAt(lookat.x, lookat.y, lookat.z);
  }
  //开启辉光
  light(model, isOpen) {
    t.runScene.modelEx.setGlow(model, isOpen);
  }
}

export default Change;
