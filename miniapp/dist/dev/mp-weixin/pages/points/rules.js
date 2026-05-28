"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  _component_wd_icon();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "rules",
  setup(__props) {
    const dynamicRules = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const honorLevels = [
      { level: 0, icon: "🌱", name: "新手上路", minPoints: 0 },
      { level: 1, icon: "🥉", name: "铜牌志愿者", minPoints: 10 },
      { level: 2, icon: "🥈", name: "银牌志愿者", minPoints: 50 },
      { level: 3, icon: "🥇", name: "金牌志愿者", minPoints: 100 },
      { level: 4, icon: "💎", name: "钻石志愿者", minPoints: 200 }
    ];
    async function fetchDynamicRules() {
      loading.value = true;
      try {
        const data = await utils_request.get("/api/points/rules");
        dynamicRules.value = data;
      } catch {
        dynamicRules.value = [];
      } finally {
        loading.value = false;
      }
    }
    common_vendor.onMounted(() => {
      fetchDynamicRules();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          name: "info",
          size: "28rpx",
          color: "#e54d42"
        }),
        b: common_vendor.p({
          name: "info",
          size: "28rpx",
          color: "#e54d42"
        }),
        c: common_vendor.f(honorLevels, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.minPoints),
            d: item.level
          };
        }),
        d: dynamicRules.value.length
      }, dynamicRules.value.length ? {
        e: common_vendor.f(dynamicRules.value, (rule, k0, i0) => {
          return {
            a: common_vendor.t(rule.title),
            b: common_vendor.t(rule.content),
            c: rule.id
          };
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94e57b2a"]]);
wx.createPage(MiniProgramPage);
