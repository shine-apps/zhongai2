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
  __name: "profile",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const nickname = common_vendor.ref(userStore.userInfo.nickname);
    const avatarUrl = common_vendor.ref(userStore.userInfo.avatar);
    const saving = common_vendor.ref(false);
    function chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          avatarUrl.value = res.tempFilePaths[0];
        }
      });
    }
    async function handleSave() {
      if (!nickname.value.trim()) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      saving.value = true;
      try {
        let avatar = avatarUrl.value;
        if (avatar && !avatar.startsWith("http")) {
          const uploadRes = await new Promise((resolve, reject) => {
            common_vendor.index.uploadFile({
              url: `${"http://localhost:3001"}/api/upload`,
              filePath: avatar,
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
          avatar = uploadRes;
        }
        await utils_request.patch("/api/users/me", {
          nickname: nickname.value,
          avatar
        });
        await userStore.fetchUserInfo();
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: avatarUrl.value || "/static/tab/user.png",
        b: common_vendor.p({
          name: "arrow-right",
          size: "28rpx",
          color: "#ccc"
        }),
        c: common_vendor.o(chooseAvatar),
        d: common_vendor.o(($event) => nickname.value = $event),
        e: common_vendor.p({
          placeholder: "请输入昵称",
          clearable: true,
          maxlength: 20,
          modelValue: nickname.value
        }),
        f: common_vendor.o(handleSave),
        g: common_vendor.p({
          type: "primary",
          block: true,
          loading: saving.value,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f6b4f04d"]]);
wx.createPage(MiniProgramPage);
