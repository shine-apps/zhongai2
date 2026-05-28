"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _component_wd_tag = common_vendor.resolveComponent("wd-tag");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  const _component_wd_loading = common_vendor.resolveComponent("wd-loading");
  (_component_wd_tag + _component_wd_icon + _component_wd_button + _component_wd_loading)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const activityId = common_vendor.ref(0);
    const activity = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const registering = common_vendor.ref(false);
    const statusMap = {
      draft: { label: "草稿", type: "info" },
      published: { label: "报名中", type: "success" },
      ongoing: { label: "进行中", type: "warning" },
      completed: { label: "已完成", type: "primary" },
      cancelled: { label: "已取消", type: "danger" }
    };
    const buttonText = common_vendor.computed(() => {
      if (!activity.value) return "";
      if (activity.value.isRegistered) return "取消报名";
      if (activity.value.status === "completed" || activity.value.status === "cancelled") return "已结束";
      if (activity.value.currentParticipants >= activity.value.maxParticipants) return "已满";
      return "立即报名";
    });
    const buttonDisabled = common_vendor.computed(() => {
      if (!activity.value) return true;
      const s = activity.value.status;
      if (s === "completed" || s === "cancelled") return true;
      if (!activity.value.isRegistered && activity.value.currentParticipants >= activity.value.maxParticipants) return true;
      return false;
    });
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
    async function handleRegister() {
      var _a;
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if ((_a = activity.value) == null ? void 0 : _a.isRegistered) {
        common_vendor.index.showModal({
          title: "提示",
          content: "确定要取消报名吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                await utils_request.post(`/api/activities/${activityId.value}/cancel`);
                common_vendor.index.showToast({ title: "已取消报名", icon: "success" });
                fetchDetail();
              } catch {
                common_vendor.index.showToast({ title: "取消报名失败", icon: "none" });
              }
            }
          }
        });
        return;
      }
      registering.value = true;
      try {
        await utils_request.post(`/api/activities/${activityId.value}/register`);
        common_vendor.index.showToast({ title: "报名成功", icon: "success" });
        fetchDetail();
      } catch {
        common_vendor.index.showToast({ title: "报名失败", icon: "none" });
      } finally {
        registering.value = false;
      }
    }
    common_vendor.onLoad((query) => {
      if (query == null ? void 0 : query.activityId) {
        activityId.value = Number(query.activityId);
        fetchDetail();
      }
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: activity.value
      }, activity.value ? {
        b: activity.value.coverImage,
        c: common_vendor.t(activity.value.title),
        d: common_vendor.t(((_a = statusMap[activity.value.status]) == null ? void 0 : _a.label) || activity.value.status),
        e: common_vendor.p({
          type: ((_b = statusMap[activity.value.status]) == null ? void 0 : _b.type) || "info",
          plain: true
        }),
        f: common_vendor.p({
          name: "clock",
          size: "28rpx",
          color: "#999"
        }),
        g: common_vendor.t(activity.value.startTime),
        h: common_vendor.t(activity.value.endTime),
        i: common_vendor.p({
          name: "location",
          size: "28rpx",
          color: "#999"
        }),
        j: common_vendor.t(activity.value.location),
        k: common_vendor.p({
          name: "user",
          size: "28rpx",
          color: "#999"
        }),
        l: common_vendor.t(activity.value.organizer),
        m: common_vendor.t(activity.value.currentParticipants),
        n: common_vendor.t(activity.value.maxParticipants),
        o: common_vendor.p({
          name: "star",
          size: "28rpx",
          color: "#e54d42"
        }),
        p: common_vendor.t(activity.value.rewardPoints),
        q: activity.value.description,
        r: common_vendor.t(buttonText.value),
        s: common_vendor.o(handleRegister),
        t: common_vendor.p({
          type: "primary",
          block: true,
          disabled: buttonDisabled.value,
          loading: registering.value,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-141de3ae"]]);
wx.createPage(MiniProgramPage);
