"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_wd_tag = common_vendor.resolveComponent("wd-tag");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  const _component_wd_grid_item = common_vendor.resolveComponent("wd-grid-item");
  const _component_wd_grid = common_vendor.resolveComponent("wd-grid");
  (_component_wd_tag + _component_wd_icon + _component_wd_button + _component_wd_grid_item + _component_wd_grid)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const quickMenus = [
      { icon: "calendar", text: "我的报名", url: "/pages/activity/list" },
      { icon: "check", text: "我的签到", url: "" },
      { icon: "wallet", text: "我的捐助", url: "/pages/donation/list" },
      { icon: "certificate", text: "实名认证", url: "/pages/user/realname" },
      { icon: "trophy", text: "排行榜", url: "/pages/ranking/index" },
      { icon: "shop", text: "爱心集市", url: "/pages/market/index" }
    ];
    const menuList = [
      { icon: "user", text: "个人资料", url: "/pages/user/profile" },
      { icon: "star", text: "积分明细", url: "/pages/points/index" },
      { icon: "medal", text: "荣誉等级", url: "" },
      { icon: "info", text: "关于我们", url: "" }
    ];
    function handleQuickMenu(item) {
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if (!item.url) {
        common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({ url: item.url });
    }
    function handleMenuClick(item) {
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if (!item.url) {
        common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
        return;
      }
      if (item.url === "/pages/points/index") {
        common_vendor.index.switchTab({ url: item.url });
      } else {
        common_vendor.index.navigateTo({ url: item.url });
      }
    }
    function goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    }
    common_vendor.onShow(() => {
      if (utils_auth.isLoggedIn()) {
        userStore.fetchUserInfo();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(utils_auth.isLoggedIn)()
      }, common_vendor.unref(utils_auth.isLoggedIn)() ? common_vendor.e({
        b: common_vendor.unref(userStore).userInfo.avatar || "/static/tab/user.png",
        c: common_vendor.t(common_vendor.unref(userStore).userInfo.nickname || "未设置昵称"),
        d: common_vendor.unref(userStore).userInfo.id
      }, common_vendor.unref(userStore).userInfo.id ? {
        e: common_vendor.t(common_vendor.unref(userStore).userInfo.id)
      } : {}, {
        f: common_vendor.unref(userStore).userInfo.level
      }, common_vendor.unref(userStore).userInfo.level ? {
        g: common_vendor.t(common_vendor.unref(userStore).userInfo.level),
        h: common_vendor.p({
          type: "primary",
          size: "small",
          plain: true
        })
      } : {}) : {
        i: common_vendor.p({
          name: "user",
          size: "64rpx",
          color: "#ccc"
        }),
        j: common_vendor.o(goLogin),
        k: common_vendor.p({
          size: "small",
          type: "primary",
          plain: true
        })
      }, {
        l: common_vendor.f(quickMenus, (item, index, i0) => {
          return {
            a: index,
            b: common_vendor.o(($event) => handleQuickMenu(item), index),
            c: "642c545b-4-" + i0 + ",642c545b-3",
            d: common_vendor.p({
              icon: item.icon,
              text: item.text
            })
          };
        }),
        m: common_vendor.p({
          column: 4,
          border: false,
          clickable: true
        }),
        n: common_vendor.f(menuList, (item, index, i0) => {
          return {
            a: "642c545b-5-" + i0,
            b: common_vendor.p({
              name: item.icon,
              size: "36rpx",
              color: "#e54d42"
            }),
            c: common_vendor.t(item.text),
            d: "642c545b-6-" + i0,
            e: index,
            f: common_vendor.o(($event) => handleMenuClick(item), index)
          };
        }),
        o: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#ccc"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-642c545b"]]);
wx.createPage(MiniProgramPage);
