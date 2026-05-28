"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
require("../../stores/user.js");
if (!Array) {
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_status_tip = common_vendor.resolveComponent("wd-status-tip");
  (_component_wd_icon + _component_wd_status_tip)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const balance = common_vendor.ref({
      total: 0,
      activityPoints: 0,
      donationPoints: 0,
      activityTotal: 0,
      donationTotal: 0
    });
    const transactions = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const displayTotal = common_vendor.ref(0);
    const typeIcons = {
      activity: "calendar",
      donation: "wallet",
      exchange: "goods",
      sign: "check"
    };
    async function fetchBalance() {
      try {
        const data = await utils_request.get("/api/points/balance");
        balance.value = data;
        animateNumber(data.total);
      } catch {
      }
    }
    async function fetchTransactions() {
      loading.value = true;
      try {
        const data = await utils_request.get("/api/points/transactions");
        transactions.value = data;
      } catch {
        transactions.value = [];
      } finally {
        loading.value = false;
      }
    }
    function animateNumber(target) {
      const duration = 800;
      const start = displayTotal.value;
      const diff = target - start;
      const startTime = Date.now();
      function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        displayTotal.value = Math.round(start + diff * eased);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }
    common_vendor.onShow(() => {
      if (utils_auth.isLoggedIn()) {
        fetchBalance();
        fetchTransactions();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(displayTotal.value),
        b: common_vendor.t(balance.value.activityPoints),
        c: common_vendor.t(balance.value.activityTotal),
        d: common_vendor.t(balance.value.donationPoints),
        e: common_vendor.t(balance.value.donationTotal),
        f: transactions.value.length
      }, transactions.value.length ? {
        g: common_vendor.f(transactions.value, (item, k0, i0) => {
          return {
            a: "692e0c56-0-" + i0,
            b: common_vendor.p({
              name: typeIcons[item.type] || "star",
              size: "36rpx",
              color: "#e54d42"
            }),
            c: common_vendor.t(item.description),
            d: common_vendor.t(item.createdAt),
            e: common_vendor.t(item.amount > 0 ? "+" : ""),
            f: common_vendor.t(item.amount),
            g: item.amount > 0 ? 1 : "",
            h: item.amount < 0 ? 1 : "",
            i: item.id
          };
        })
      } : !loading.value ? {
        i: common_vendor.p({
          image: "content",
          tip: "暂无积分记录"
        })
      } : {}, {
        h: !loading.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-692e0c56"]]);
wx.createPage(MiniProgramPage);
