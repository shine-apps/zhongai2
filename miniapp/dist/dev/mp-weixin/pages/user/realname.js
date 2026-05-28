"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_input = common_vendor.resolveComponent("wd-input");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  (_component_wd_icon + _component_wd_input + _component_wd_button)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "realname",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const realName = common_vendor.ref("");
    const idCard = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    const isVerified = common_vendor.computed(() => userStore.userInfo.isRealNameVerified);
    const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    function validateIdCard() {
      if (!idCardPattern.test(idCard.value)) {
        common_vendor.index.showToast({ title: "请输入有效的身份证号", icon: "none" });
        return false;
      }
      return true;
    }
    async function handleSubmit() {
      if (!realName.value.trim()) {
        common_vendor.index.showToast({ title: "请输入真实姓名", icon: "none" });
        return;
      }
      if (!validateIdCard()) return;
      submitting.value = true;
      try {
        await utils_request.post("/api/users/me/realname", {
          realName: realName.value,
          idCard: idCard.value
        });
        await userStore.fetchUserInfo();
        common_vendor.index.showToast({ title: "认证成功", icon: "success" });
      } catch {
        common_vendor.index.showToast({ title: "认证失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    common_vendor.onShow(() => {
      if (userStore.userInfo.isRealNameVerified && userStore.userInfo.realName) {
        realName.value = userStore.userInfo.realName;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isVerified.value
      }, isVerified.value ? {
        b: common_vendor.p({
          name: "check-outline",
          size: "64rpx",
          color: "#07c160"
        }),
        c: common_vendor.t(realName.value)
      } : {
        d: common_vendor.o(($event) => realName.value = $event),
        e: common_vendor.p({
          placeholder: "请输入真实姓名",
          clearable: true,
          maxlength: 20,
          modelValue: realName.value
        }),
        f: common_vendor.o(($event) => idCard.value = $event),
        g: common_vendor.p({
          placeholder: "请输入身份证号",
          clearable: true,
          maxlength: 18,
          modelValue: idCard.value
        }),
        h: common_vendor.p({
          name: "info",
          size: "24rpx",
          color: "#999"
        }),
        i: common_vendor.o(handleSubmit),
        j: common_vendor.p({
          type: "primary",
          block: true,
          loading: submitting.value,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8e9ad91e"]]);
wx.createPage(MiniProgramPage);
