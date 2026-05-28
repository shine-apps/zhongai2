"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _component_wd_tab = common_vendor.resolveComponent("wd-tab");
  const _component_wd_tabs = common_vendor.resolveComponent("wd-tabs");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_tag = common_vendor.resolveComponent("wd-tag");
  const _component_wd_loadmore = common_vendor.resolveComponent("wd-loadmore");
  (_component_wd_tab + _component_wd_tabs + _component_wd_icon + _component_wd_tag + _component_wd_loadmore)();
}
const pageSize = 10;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const tabs = [
      { name: "全部", value: "" },
      { name: "环保", value: "environment" },
      { name: "助老", value: "elderly" },
      { name: "助学", value: "education" },
      { name: "社区", value: "community" },
      { name: "医疗", value: "medical" }
    ];
    const currentTab = common_vendor.ref(0);
    const activities = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const total = common_vendor.ref(0);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const keyword = common_vendor.ref("");
    const currentCategory = common_vendor.computed(() => tabs[currentTab.value].value);
    const statusMap = {
      draft: { label: "草稿", type: "info" },
      published: { label: "报名中", type: "success" },
      ongoing: { label: "进行中", type: "warning" },
      completed: { label: "已完成", type: "primary" },
      cancelled: { label: "已取消", type: "danger" }
    };
    async function fetchActivities(reset = false) {
      if (loading.value) return;
      if (!reset && finished.value) return;
      if (reset) {
        page.value = 1;
        finished.value = false;
        activities.value = [];
      }
      loading.value = true;
      try {
        const params = {
          page: page.value,
          pageSize
        };
        if (currentCategory.value) {
          params.category = currentCategory.value;
        }
        if (keyword.value) {
          params.keyword = keyword.value;
        }
        const data = await utils_request.get("/api/activities", params);
        if (reset) {
          activities.value = data.list;
        } else {
          activities.value.push(...data.list);
        }
        total.value = data.total;
        if (activities.value.length >= data.total) {
          finished.value = true;
        }
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
      }
    }
    function onTabChange({ index }) {
      currentTab.value = index;
      fetchActivities(true);
    }
    function goDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/activity/detail?activityId=${id}` });
    }
    common_vendor.onLoad((query) => {
      if (query == null ? void 0 : query.keyword) {
        keyword.value = query.keyword;
      }
      fetchActivities(true);
    });
    common_vendor.onReachBottom(() => {
      if (!finished.value) {
        page.value++;
        fetchActivities();
      }
    });
    common_vendor.onPullDownRefresh(async () => {
      await fetchActivities(true);
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: tab.value,
            b: "a098bff7-1-" + i0 + ",a098bff7-0",
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
        e: common_vendor.f(activities.value, (item, k0, i0) => {
          var _a, _b;
          return {
            a: item.coverImage,
            b: common_vendor.t(item.title),
            c: "a098bff7-2-" + i0,
            d: common_vendor.t(item.startTime),
            e: "a098bff7-3-" + i0,
            f: common_vendor.t(item.location),
            g: common_vendor.t(((_a = statusMap[item.status]) == null ? void 0 : _a.label) || item.status),
            h: "a098bff7-4-" + i0,
            i: common_vendor.p({
              type: ((_b = statusMap[item.status]) == null ? void 0 : _b.type) || "info",
              size: "small",
              plain: true
            }),
            j: "a098bff7-5-" + i0,
            k: common_vendor.t(item.rewardPoints),
            l: item.id,
            m: common_vendor.o(($event) => goDetail(item.id), item.id)
          };
        }),
        f: common_vendor.p({
          name: "clock",
          size: "22rpx",
          color: "#999"
        }),
        g: common_vendor.p({
          name: "location",
          size: "22rpx",
          color: "#999"
        }),
        h: common_vendor.p({
          name: "star",
          size: "20rpx",
          color: "#e54d42"
        }),
        i: common_vendor.p({
          state: finished.value ? "finished" : loading.value ? "loading" : "error"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a098bff7"]]);
wx.createPage(MiniProgramPage);
