"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _component_wd_tab = common_vendor.resolveComponent("wd-tab");
  const _component_wd_tabs = common_vendor.resolveComponent("wd-tabs");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_tag = common_vendor.resolveComponent("wd-tag");
  const _component_wd_status_tip = common_vendor.resolveComponent("wd-status-tip");
  (_component_wd_tab + _component_wd_tabs + _component_wd_icon + _component_wd_tag + _component_wd_status_tip)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const tabs = [
      { name: "全部", value: "" },
      { name: "待审核", value: "pending" },
      { name: "已通过", value: "approved" },
      { name: "已拒绝", value: "rejected" }
    ];
    const currentTab = common_vendor.ref(0);
    const donations = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const currentStatus = common_vendor.computed(() => tabs[currentTab.value].value);
    const statusMap = {
      pending: { label: "待审核", type: "warning" },
      approved: { label: "已通过", type: "success" },
      rejected: { label: "已拒绝", type: "danger" }
    };
    async function fetchDonations() {
      loading.value = true;
      try {
        const params = {};
        if (currentStatus.value) {
          params.status = currentStatus.value;
        }
        const data = await utils_request.get("/api/donations/me", params);
        donations.value = data;
      } catch {
        donations.value = [];
      } finally {
        loading.value = false;
      }
    }
    function onTabChange({ index }) {
      currentTab.value = index;
      fetchDonations();
    }
    function formatAmount(item) {
      if (item.type === "money") {
        return `¥${item.amount.toFixed(2)}`;
      }
      return item.materialDesc || "物资捐助";
    }
    common_vendor.onShow(() => {
      fetchDonations();
    });
    common_vendor.onPullDownRefresh(async () => {
      await fetchDonations();
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: tab.value,
            b: "2202f55e-1-" + i0 + ",2202f55e-0",
            c: common_vendor.p({
              name: tab.name
            })
          };
        }),
        b: common_vendor.o(onTabChange),
        c: common_vendor.o(($event) => currentTab.value = $event),
        d: common_vendor.p({
          modelValue: currentTab.value
        }),
        e: common_vendor.f(donations.value, (item, k0, i0) => {
          var _a, _b;
          return {
            a: "2202f55e-2-" + i0,
            b: common_vendor.p({
              name: item.type === "money" ? "wallet" : "goods",
              size: "40rpx",
              color: "#e54d42"
            }),
            c: common_vendor.t(formatAmount(item)),
            d: common_vendor.t(item.createdAt),
            e: common_vendor.t(((_a = statusMap[item.status]) == null ? void 0 : _a.label) || item.status),
            f: "2202f55e-3-" + i0,
            g: common_vendor.p({
              type: ((_b = statusMap[item.status]) == null ? void 0 : _b.type) || "info",
              size: "small",
              plain: true
            }),
            h: item.id
          };
        }),
        f: !loading.value && !donations.value.length
      }, !loading.value && !donations.value.length ? {
        g: common_vendor.p({
          image: "content",
          tip: "暂无捐助记录"
        })
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2202f55e"]]);
wx.createPage(MiniProgramPage);
