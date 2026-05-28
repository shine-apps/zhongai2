"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _component_wd_search = common_vendor.resolveComponent("wd-search");
  const _component_wd_swiper = common_vendor.resolveComponent("wd-swiper");
  const _component_wd_grid_item = common_vendor.resolveComponent("wd-grid-item");
  const _component_wd_grid = common_vendor.resolveComponent("wd-grid");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_status_tip = common_vendor.resolveComponent("wd-status-tip");
  (_component_wd_search + _component_wd_swiper + _component_wd_grid_item + _component_wd_grid + _component_wd_icon + _component_wd_status_tip)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const banners = common_vendor.ref([]);
    const activities = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    async function fetchBanners() {
      try {
        const data = await utils_request.get("/api/banners");
        banners.value = data;
      } catch {
        banners.value = [];
      }
    }
    async function fetchActivities() {
      loading.value = true;
      try {
        const data = await utils_request.get("/api/activities", { pageSize: 4, status: "published" });
        activities.value = data;
      } catch {
        activities.value = [];
      } finally {
        loading.value = false;
      }
    }
    function handleSearch(val) {
      if (!val.trim()) return;
      common_vendor.index.navigateTo({ url: `/pages/activity/list?keyword=${encodeURIComponent(val)}` });
    }
    function handleGridClick(index) {
      const routes = [
        "/pages/activity/list",
        "/pages/donation/submit",
        "/pages/points/index",
        "/pages/user/realname",
        "/pages/ranking/index",
        "/pages/market/index",
        "/pages/honor/index",
        "/pages/feedback/create"
      ];
      const url = routes[index];
      if (index === 0) {
        common_vendor.index.switchTab({ url });
      } else if (!utils_auth.isLoggedIn() && index < 4) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
      } else {
        common_vendor.index.navigateTo({ url });
      }
    }
    function goDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/activity/detail?activityId=${id}` });
    }
    common_vendor.onShow(() => {
      fetchBanners();
      fetchActivities();
    });
    common_vendor.onPullDownRefresh(async () => {
      await Promise.all([fetchBanners(), fetchActivities()]);
      common_vendor.index.stopPullDownRefresh();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleSearch),
        b: common_vendor.p({
          placeholder: "搜索公益活动"
        }),
        c: banners.value.length
      }, banners.value.length ? {
        d: common_vendor.p({
          list: banners.value.map((b) => b.image),
          autoplay: true,
          ["indicator-position"]: "bottom-right"
        })
      } : {}, {
        e: common_vendor.o(($event) => handleGridClick(0)),
        f: common_vendor.p({
          icon: "calendar",
          text: "活动报名"
        }),
        g: common_vendor.o(($event) => handleGridClick(1)),
        h: common_vendor.p({
          icon: "goods",
          text: "爱心捐助"
        }),
        i: common_vendor.o(($event) => handleGridClick(2)),
        j: common_vendor.p({
          icon: "star",
          text: "积分商城"
        }),
        k: common_vendor.o(($event) => handleGridClick(3)),
        l: common_vendor.p({
          icon: "certificate",
          text: "实名认证"
        }),
        m: common_vendor.o(($event) => handleGridClick(4)),
        n: common_vendor.p({
          icon: "trophy",
          text: "排行榜"
        }),
        o: common_vendor.o(($event) => handleGridClick(5)),
        p: common_vendor.p({
          icon: "shop",
          text: "爱心集市"
        }),
        q: common_vendor.o(($event) => handleGridClick(6)),
        r: common_vendor.p({
          icon: "medal",
          text: "荣誉商城"
        }),
        s: common_vendor.o(($event) => handleGridClick(7)),
        t: common_vendor.p({
          icon: "comment",
          text: "意见反馈"
        }),
        v: common_vendor.p({
          column: 4,
          border: false,
          clickable: true
        }),
        w: common_vendor.o(($event) => _ctx.uni.switchTab({
          url: "/pages/activity/list"
        })),
        x: activities.value.length
      }, activities.value.length ? {
        y: common_vendor.f(activities.value, (item, k0, i0) => {
          return {
            a: item.coverImage,
            b: common_vendor.t(item.title),
            c: "83a5a03c-11-" + i0,
            d: common_vendor.t(item.startTime),
            e: "83a5a03c-12-" + i0,
            f: common_vendor.t(item.location),
            g: common_vendor.t(item.currentParticipants),
            h: common_vendor.t(item.maxParticipants),
            i: "83a5a03c-13-" + i0,
            j: common_vendor.t(item.rewardPoints),
            k: item.id,
            l: common_vendor.o(($event) => goDetail(item.id), item.id)
          };
        }),
        z: common_vendor.p({
          name: "clock",
          size: "24rpx",
          color: "#999"
        }),
        A: common_vendor.p({
          name: "location",
          size: "24rpx",
          color: "#999"
        }),
        B: common_vendor.p({
          name: "star",
          size: "22rpx",
          color: "#e54d42"
        })
      } : !loading.value ? {
        D: common_vendor.p({
          image: "content",
          tip: "暂无热门活动"
        })
      } : {}, {
        C: !loading.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
