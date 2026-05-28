"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_textarea = common_vendor.resolveComponent("wd-textarea");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  const _component_wd_loading = common_vendor.resolveComponent("wd-loading");
  (_component_wd_icon + _component_wd_textarea + _component_wd_button + _component_wd_loading)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "register",
  setup(__props) {
    const activityId = common_vendor.ref(0);
    const activity = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const remark = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    async function fetchDetail() {
      loading.value = true;
      try {
        const data = await utils_request.get(`/api/activities/${activityId.value}`);
        activity.value = data;
      } catch {
        common_vendor.index.showToast({ title: "获取活动详情失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    async function handleSubmit() {
      var _a;
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if ((_a = activity.value) == null ? void 0 : _a.isRegistered) {
        common_vendor.index.showToast({ title: "您已报名该活动", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await utils_request.post(`/api/activities/${activityId.value}/register`, {
          remark: remark.value
        });
        common_vendor.index.showToast({ title: "报名成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch {
        common_vendor.index.showToast({ title: "报名失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    common_vendor.onLoad((query) => {
      if (query == null ? void 0 : query.activityId) {
        activityId.value = Number(query.activityId);
        fetchDetail();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: activity.value
      }, activity.value ? {
        b: common_vendor.p({
          name: "calendar",
          size: "28rpx",
          color: "#e54d42"
        }),
        c: common_vendor.t(activity.value.title),
        d: common_vendor.p({
          name: "clock",
          size: "28rpx",
          color: "#e54d42"
        }),
        e: common_vendor.t(activity.value.startTime),
        f: common_vendor.t(activity.value.endTime),
        g: common_vendor.p({
          name: "location",
          size: "28rpx",
          color: "#e54d42"
        }),
        h: common_vendor.t(activity.value.location),
        i: common_vendor.p({
          name: "star",
          size: "28rpx",
          color: "#e54d42"
        }),
        j: common_vendor.t(activity.value.rewardPoints),
        k: common_vendor.o(($event) => remark.value = $event),
        l: common_vendor.p({
          placeholder: "请输入备注信息（选填）",
          maxlength: 200,
          ["show-word-limit"]: true,
          modelValue: remark.value
        }),
        m: common_vendor.t(activity.value.isRegistered ? "已报名" : "确认报名"),
        n: common_vendor.o(handleSubmit),
        o: common_vendor.p({
          type: "primary",
          block: true,
          loading: submitting.value,
          disabled: activity.value.isRegistered,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-622dd451"]]);
wx.createPage(MiniProgramPage);
