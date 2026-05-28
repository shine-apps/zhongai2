"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  (_component_wd_icon + _component_wd_button)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const loading = common_vendor.ref(false);
    const userStore = stores_user.useUserStore();
    function handleGetPhoneNumber(e) {
      if (e.detail.errMsg !== "getPhoneNumber:ok") {
        common_vendor.index.showToast({ title: "需要授权手机号才能登录", icon: "none" });
        return;
      }
      const phoneCode = e.detail.code;
      doLogin(phoneCode);
    }
    async function doLogin(phoneCode) {
      loading.value = true;
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        await new Promise((resolve, reject) => {
          common_vendor.index.checkSession({
            success: resolve,
            fail: reject
          });
        });
        const data = await utils_request.post("/api/auth/login", {
          code: loginRes.code,
          phoneCode
        });
        utils_auth.setToken(data.token);
        await userStore.fetchUserInfo();
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      } catch {
        common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          name: "heart-fill",
          size: "120rpx",
          color: "#fff"
        }),
        b: common_vendor.p({
          type: "primary",
          block: true,
          loading: loading.value,
          ["custom-style"]: "border-radius: 48rpx; height: 96rpx; font-size: 32rpx;"
        }),
        c: common_vendor.o(handleGetPhoneNumber),
        d: loading.value
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-45258083"]]);
wx.createPage(MiniProgramPage);
