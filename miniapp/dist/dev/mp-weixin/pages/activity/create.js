"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_wd_input = common_vendor.resolveComponent("wd-input");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_textarea = common_vendor.resolveComponent("wd-textarea");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  const _component_wd_picker = common_vendor.resolveComponent("wd-picker");
  const _component_wd_datetime_picker = common_vendor.resolveComponent("wd-datetime-picker");
  (_component_wd_input + _component_wd_icon + _component_wd_textarea + _component_wd_button + _component_wd_picker + _component_wd_datetime_picker)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "create",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const title = common_vendor.ref("");
    const category = common_vendor.ref("");
    const description = common_vendor.ref("");
    const coverImage = common_vendor.ref("");
    const startTime = common_vendor.ref("");
    const endTime = common_vendor.ref("");
    const location = common_vendor.ref("");
    const latitude = common_vendor.ref(0);
    const longitude = common_vendor.ref(0);
    const checkinRadius = common_vendor.ref(200);
    const maxParticipants = common_vendor.ref(50);
    const rewardPoints = common_vendor.ref(10);
    const submitting = common_vendor.ref(false);
    const categoryOptions = [
      { value: "elder_care", label: "助老" },
      { value: "education", label: "助学" },
      { value: "env", label: "环保" },
      { value: "disaster", label: "救灾" },
      { value: "other", label: "其他" }
    ];
    const categoryPickerVisible = common_vendor.ref(false);
    const categoryColumns = categoryOptions.map((o) => ({ value: o.value, label: o.label }));
    const startTimePickerVisible = common_vendor.ref(false);
    const endTimePickerVisible = common_vendor.ref(false);
    const currentDatetime = Date.now();
    const categoryLabel = common_vendor.computed(() => {
      const opt = categoryOptions.find((o) => o.value === category.value);
      return opt ? opt.label : "请选择分类";
    });
    const isLeader = common_vendor.computed(() => {
      const role = userStore.userInfo.role;
      return role === "leader" || role === "admin";
    });
    function onCategoryConfirm({ value }) {
      category.value = value;
      categoryPickerVisible.value = false;
    }
    function onStartTimeConfirm({ value }) {
      const d = new Date(value);
      startTime.value = formatDate(d);
      startTimePickerVisible.value = false;
    }
    function onEndTimeConfirm({ value }) {
      const d = new Date(value);
      endTime.value = formatDate(d);
      endTimePickerVisible.value = false;
    }
    function formatDate(d) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function chooseCoverImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          uploadCoverImage(res.tempFilePaths[0]);
        }
      });
    }
    async function uploadCoverImage(filePath) {
      try {
        const url = await new Promise((resolve, reject) => {
          common_vendor.index.uploadFile({
            url: `${"http://localhost:3001"}/api/upload`,
            filePath,
            name: "file",
            success(res) {
              var _a;
              if (res.statusCode === 200) {
                const data = JSON.parse(res.data);
                resolve(((_a = data.data) == null ? void 0 : _a.url) || "");
              } else {
                reject(new Error("上传失败"));
              }
            },
            fail: reject
          });
        });
        coverImage.value = url;
      } catch {
        common_vendor.index.showToast({ title: "封面上传失败", icon: "none" });
      }
    }
    function chooseLocation() {
      common_vendor.index.chooseLocation({
        success: (res) => {
          location.value = res.name || res.address;
          latitude.value = res.latitude;
          longitude.value = res.longitude;
        },
        fail: () => {
          common_vendor.index.showToast({ title: "选择位置失败", icon: "none" });
        }
      });
    }
    function validate() {
      if (!title.value.trim()) {
        common_vendor.index.showToast({ title: "请输入活动标题", icon: "none" });
        return false;
      }
      if (!category.value) {
        common_vendor.index.showToast({ title: "请选择活动分类", icon: "none" });
        return false;
      }
      if (!description.value.trim()) {
        common_vendor.index.showToast({ title: "请输入活动描述", icon: "none" });
        return false;
      }
      if (!startTime.value) {
        common_vendor.index.showToast({ title: "请选择开始时间", icon: "none" });
        return false;
      }
      if (!endTime.value) {
        common_vendor.index.showToast({ title: "请选择结束时间", icon: "none" });
        return false;
      }
      if (!location.value.trim()) {
        common_vendor.index.showToast({ title: "请选择活动地点", icon: "none" });
        return false;
      }
      if (maxParticipants.value <= 0) {
        common_vendor.index.showToast({ title: "请输入有效的参与人数上限", icon: "none" });
        return false;
      }
      if (rewardPoints.value < 0) {
        common_vendor.index.showToast({ title: "奖励积分不能为负数", icon: "none" });
        return false;
      }
      return true;
    }
    async function handleSubmit() {
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if (!isLeader.value) {
        common_vendor.index.showToast({ title: "仅队长/管理员可创建活动", icon: "none" });
        return;
      }
      if (!validate()) return;
      submitting.value = true;
      try {
        await utils_request.post("/api/activities", {
          title: title.value,
          category: category.value,
          description: description.value,
          coverImage: coverImage.value,
          startTime: startTime.value,
          endTime: endTime.value,
          location: location.value,
          latitude: latitude.value,
          longitude: longitude.value,
          checkinRadius: checkinRadius.value,
          maxParticipants: maxParticipants.value,
          rewardPoints: rewardPoints.value
        });
        common_vendor.index.showToast({ title: "创建成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch {
        common_vendor.index.showToast({ title: "创建失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    common_vendor.onLoad(() => {
      if (!isLeader.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "仅队长/管理员可创建活动",
          showCancel: false,
          success: () => {
            common_vendor.index.navigateBack();
          }
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => title.value = $event),
        b: common_vendor.p({
          placeholder: "请输入活动标题",
          clearable: true,
          maxlength: 50,
          modelValue: title.value
        }),
        c: common_vendor.t(categoryLabel.value),
        d: common_vendor.n({
          placeholder: !category.value
        }),
        e: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#999"
        }),
        f: common_vendor.o(($event) => categoryPickerVisible.value = true),
        g: common_vendor.o(($event) => description.value = $event),
        h: common_vendor.p({
          placeholder: "请输入活动描述",
          maxlength: 2e3,
          ["show-word-limit"]: true,
          modelValue: description.value
        }),
        i: coverImage.value
      }, coverImage.value ? {
        j: coverImage.value
      } : {
        k: common_vendor.p({
          name: "add",
          size: "48rpx",
          color: "#ccc"
        })
      }, {
        l: common_vendor.o(chooseCoverImage),
        m: common_vendor.t(startTime.value || "请选择开始时间"),
        n: common_vendor.n({
          placeholder: !startTime.value
        }),
        o: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#999"
        }),
        p: common_vendor.o(($event) => startTimePickerVisible.value = true),
        q: common_vendor.t(endTime.value || "请选择结束时间"),
        r: common_vendor.n({
          placeholder: !endTime.value
        }),
        s: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#999"
        }),
        t: common_vendor.o(($event) => endTimePickerVisible.value = true),
        v: common_vendor.t(location.value || "请选择活动地点"),
        w: common_vendor.n({
          placeholder: !location.value
        }),
        x: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#999"
        }),
        y: common_vendor.o(chooseLocation),
        z: common_vendor.o(($event) => checkinRadius.value = $event),
        A: common_vendor.p({
          type: "number",
          placeholder: "签到范围（米）",
          modelValue: checkinRadius.value
        }),
        B: common_vendor.o(($event) => maxParticipants.value = $event),
        C: common_vendor.p({
          type: "number",
          placeholder: "最大参与人数",
          modelValue: maxParticipants.value
        }),
        D: common_vendor.o(($event) => rewardPoints.value = $event),
        E: common_vendor.p({
          type: "number",
          placeholder: "活动奖励积分",
          modelValue: rewardPoints.value
        }),
        F: common_vendor.o(handleSubmit),
        G: common_vendor.p({
          type: "primary",
          block: true,
          loading: submitting.value,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        }),
        H: common_vendor.o(onCategoryConfirm),
        I: common_vendor.o(($event) => categoryPickerVisible.value = false),
        J: common_vendor.o(($event) => category.value = $event),
        K: common_vendor.p({
          columns: common_vendor.unref(categoryColumns),
          visible: categoryPickerVisible.value,
          modelValue: category.value
        }),
        L: common_vendor.o(onStartTimeConfirm),
        M: common_vendor.o(($event) => startTimePickerVisible.value = false),
        N: common_vendor.o(($event) => common_vendor.isRef(currentDatetime) ? currentDatetime.value = $event : null),
        O: common_vendor.p({
          visible: startTimePickerVisible.value,
          type: "datetime",
          modelValue: common_vendor.unref(currentDatetime)
        }),
        P: common_vendor.o(onEndTimeConfirm),
        Q: common_vendor.o(($event) => endTimePickerVisible.value = false),
        R: common_vendor.o(($event) => common_vendor.isRef(currentDatetime) ? currentDatetime.value = $event : null),
        S: common_vendor.p({
          visible: endTimePickerVisible.value,
          type: "datetime",
          modelValue: common_vendor.unref(currentDatetime)
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f5612ec3"]]);
wx.createPage(MiniProgramPage);
