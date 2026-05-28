"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/activity/list.js";
  "./pages/activity/detail.js";
  "./pages/activity/register.js";
  "./pages/activity/create.js";
  "./pages/donation/submit.js";
  "./pages/donation/list.js";
  "./pages/points/index.js";
  "./pages/points/rules.js";
  "./pages/user/index.js";
  "./pages/user/profile.js";
  "./pages/user/realname.js";
  "./pages/login/index.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      console.log("App Launch");
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return { app };
}
createApp().app.mount("#app");
exports.createApp = createApp;
